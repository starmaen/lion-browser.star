package com.starmaen.lionbrowser;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.MimeTypeMap;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONTokener;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * متصفح حقيقي: يدير WebView أصلي لكل تبويب ويضعه فوق واجهة React
 * في المساحة التي تحددها الواجهة (setBounds).
 */
@CapacitorPlugin(name = "LionWebView")
public class LionWebViewPlugin extends Plugin {

    private final Map<String, WebView> views = new HashMap<>();
    private final Map<String, Boolean> desktop = new HashMap<>();
    private String activeTab = null;
    private boolean shown = false;

    // مكان المساحة بوحدات CSS px (من الواجهة)
    private double bl = 0, bt = 0, bw = 0, bh = 0;

    private String mobileUa = "";
    private String desktopUa = "";

    private View customView;
    private WebChromeClient.CustomViewCallback customCallback;
    private FrameLayout customContainer;

    private ValueCallback<Uri[]> filePathCallback;
    private ActivityResultLauncher<Intent> fileLauncher;
    private OnBackPressedCallback backCallback;

    private DownloadManager dm;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Set<Long> activeDownloads = new HashSet<>();
    private boolean polling = false;

    // اكتشاف الفيديوهات (mp4/webm..) في الصفحات العادية
    private final Map<String, String> lastVideos = new HashMap<>();
    private boolean scanning = false;
    private static final String SCAN_JS =
            "(function(){var r=[];function a(u){if(u&&/^https?:/i.test(u)&&/\\.(mp4|webm|mkv|mov|3gp|m4v)(\\?|#|$)/i.test(u)&&r.indexOf(u)<0)r.push(u);}"
            + "document.querySelectorAll('video').forEach(function(v){a(v.currentSrc);a(v.src);"
            + "v.querySelectorAll('source').forEach(function(s){a(s.src);});});return JSON.stringify(r);})()";

    // ------------------------------------------------------------------ setup

    @Override
    public void load() {
        dm = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);

        String def = WebSettings.getDefaultUserAgent(getContext());
        // إزالة علامة WebView حتى تعامل المواقع (غوغل/يوتيوب) المتصفح كمتصفح عادي
        mobileUa = def.replace("; wv", "").replaceAll("Version/\\d+(\\.\\d+)* ", "");
        Matcher m = Pattern.compile("Chrome/([\\d.]+)").matcher(def);
        String chrome = m.find() ? m.group(1) : "126.0.0.0";
        desktopUa = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"
                + chrome + " Safari/537.36";

        try {
            fileLauncher = getActivity().registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (filePathCallback == null) return;
                        Uri[] r = WebChromeClient.FileChooserParams.parseResult(
                                result.getResultCode(), result.getData());
                        filePathCallback.onReceiveValue(r);
                        filePathCallback = null;
                    });
        } catch (Exception e) {
            fileLauncher = null;
        }

        backCallback = new OnBackPressedCallback(false) {
            @Override
            public void handleOnBackPressed() {
                onBack();
            }
        };
        getActivity().getOnBackPressedDispatcher().addCallback(getActivity(), backCallback);
    }

    protected void handleOnDestroy() {
        handler.removeCallbacksAndMessages(null);
        for (WebView w : views.values()) {
            try {
                w.destroy();
            } catch (Exception ignored) {
            }
        }
        views.clear();
    }

    // ---------------------------------------------------------------- helpers

    private void ui(Runnable r) {
        getActivity().runOnUiThread(r);
    }

    private FrameLayout root() {
        return getActivity().findViewById(android.R.id.content);
    }

    private WebView active() {
        return activeTab == null ? null : views.get(activeTab);
    }

    private static String norm(String u) {
        if (u == null) return "";
        int h = u.indexOf('#');
        if (h >= 0) u = u.substring(0, h);
        while (u.endsWith("/")) u = u.substring(0, u.length() - 1);
        return u;
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    /** يقبل http/https فقط؛ ويضيف https:// للعنوان بلا بروتوكول */
    private static String fixUrl(String url) {
        if (url == null) return null;
        String u = url.trim();
        if (u.isEmpty()) return null;
        String low = u.toLowerCase();
        if (low.startsWith("http://") || low.startsWith("https://")) return u;
        if (low.equals("about:blank")) return u;
        if (u.contains("://") || low.startsWith("javascript:") || low.startsWith("data:")
                || low.startsWith("file:") || low.startsWith("content:")) return null;
        return "https://" + u;
    }

    private void readBounds(JSObject d) {
        if (d == null) return;
        bl = d.optDouble("left", bl);
        bt = d.optDouble("top", bt);
        bw = d.optDouble("width", bw);
        bh = d.optDouble("height", bh);
    }

    private void applyBounds(WebView w) {
        FrameLayout root = root();
        if (root == null || w == null) return;
        float d = getContext().getResources().getDisplayMetrics().density;
        int[] a = new int[2];
        int[] b = new int[2];
        getBridge().getWebView().getLocationInWindow(a);
        root.getLocationInWindow(b);
        int left = (int) Math.round(bl * d) + (a[0] - b[0]);
        int top = (int) Math.round(bt * d) + (a[1] - b[1]);
        int width = Math.max(1, (int) Math.round(bw * d));
        int height = Math.max(1, (int) Math.round(bh * d));
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(width, height, Gravity.TOP | Gravity.LEFT);
        lp.leftMargin = left;
        lp.topMargin = top;
        w.setLayoutParams(lp);
    }

    private void refreshBack() {
        if (backCallback == null) return;
        backCallback.setEnabled(customView != null || (shown && active() != null));
    }

    private void onBack() {
        if (customView != null) {
            hideCustom();
            return;
        }
        WebView w = active();
        if (w != null && w.canGoBack()) {
            w.goBack();
        } else {
            notifyListeners("backAtRoot", new JSObject());
        }
    }

    private void setDesktop(String tabId, WebView w, boolean enabled, boolean reload) {
        Boolean cur = desktop.get(tabId);
        boolean was = cur != null && cur;
        if (cur == null || was != enabled) {
            WebSettings s = w.getSettings();
            s.setUserAgentString(enabled ? desktopUa : mobileUa);
            s.setLoadWithOverviewMode(enabled);
            s.setUseWideViewPort(true);
            desktop.put(tabId, enabled);
            if (reload && cur != null && w.getUrl() != null) w.reload();
        }
    }

    private void emit(String tabId, WebView v, String url, boolean loading) {
        JSObject o = new JSObject();
        String u = url != null ? url : v.getUrl();
        o.put("tabId", tabId);
        o.put("url", u != null ? u : "");
        String t = v.getTitle();
        o.put("title", t != null ? t : "");
        o.put("loading", loading);
        o.put("progress", v.getProgress());
        o.put("canGoBack", v.canGoBack());
        o.put("canGoForward", v.canGoForward());
        notifyListeners("pageInfo", o);
    }

    private void setSystemBars(boolean visible) {
        try {
            WindowInsetsControllerCompat c = WindowCompat.getInsetsController(
                    getActivity().getWindow(), getActivity().getWindow().getDecorView());
            if (c == null) return;
            if (visible) {
                c.show(WindowInsetsCompat.Type.systemBars());
            } else {
                c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                c.hide(WindowInsetsCompat.Type.systemBars());
            }
        } catch (Exception ignored) {
        }
    }

    private void hideCustom() {
        if (customView == null) return;
        FrameLayout r = root();
        if (customContainer != null) {
            if (r != null) r.removeView(customContainer);
            customContainer.removeAllViews();
        }
        WebChromeClient.CustomViewCallback cb = customCallback;
        customContainer = null;
        customView = null;
        customCallback = null;
        if (cb != null) {
            try {
                cb.onCustomViewHidden();
            } catch (Exception ignored) {
            }
        }
        setSystemBars(true);
        refreshBack();
    }

    private void showError(WebView v, String url, String desc) {
        String html = "<html dir='rtl'><head><meta charset='utf-8'>"
                + "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                + "<style>body{font-family:sans-serif;background:#0f172a;color:#e2e8f0;display:flex;"
                + "flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;"
                + "text-align:center;padding:24px}h2{color:#f59e0b}small{color:#94a3b8;word-break:break-all}"
                + "</style></head><body><h2>\u062A\u0639\u0630\u0651\u0631 \u0641\u062A\u062D \u0627\u0644\u0635\u0641\u062D\u0629</h2>"
                + "<p>" + esc(desc) + "</p><small>" + esc(url) + "</small></body></html>";
        v.loadDataWithBaseURL(url, html, "text/html", "UTF-8", url);
    }

    private boolean handleUrl(String url) {
        Uri u = Uri.parse(url);
        String s = u.getScheme();
        if (s == null) return false;
        s = s.toLowerCase();
        if (s.equals("http") || s.equals("https") || s.equals("about") || s.equals("blob") || s.equals("data")) {
            return false;
        }
        if (s.equals("file") || s.equals("content") || s.equals("javascript")) {
            return true; // ممنوع
        }
        try {
            Intent i = s.equals("intent")
                    ? Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                    : new Intent(Intent.ACTION_VIEW, u);
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            i.setComponent(null);
            i.setSelector(null);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(i);
        } catch (Exception ignored) {
        }
        return true;
    }

    // -------------------------------------------------------------- WebView

    @SuppressLint("SetJavaScriptEnabled")
    private WebView createView(final String tabId) {
        final WebView w = new WebView(getActivity());
        w.setBackgroundColor(Color.WHITE);
        w.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);

        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setLoadWithOverviewMode(false);
        s.setUseWideViewPort(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportMultipleWindows(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setUserAgentString(mobileUa);

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(w, true);

        w.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                return handleUrl(r.getUrl().toString());
            }

            @Override
            public void onPageStarted(WebView v, String url, Bitmap favicon) {
                emit(tabId, v, url, true);
                lastVideos.put(tabId, "");
                JSObject vf = new JSObject();
                vf.put("tabId", tabId);
                vf.put("urls", "");
                notifyListeners("videoFound", vf);
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                emit(tabId, v, url, false);
            }

            @Override
            public void doUpdateVisitedHistory(WebView v, String url, boolean isReload) {
                emit(tabId, v, url, v.getProgress() < 100);
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame() && e.getErrorCode() != WebViewClient.ERROR_UNKNOWN) {
                    showError(v, r.getUrl().toString(), String.valueOf(e.getDescription()));
                }
            }
        });

        w.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView v, int p) {
                emit(tabId, v, v.getUrl(), p < 100);
            }

            @Override
            public void onReceivedTitle(WebView v, String t) {
                emit(tabId, v, v.getUrl(), v.getProgress() < 100);
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback cb) {
                if (customView != null) {
                    cb.onCustomViewHidden();
                    return;
                }
                FrameLayout r = root();
                if (r == null) {
                    cb.onCustomViewHidden();
                    return;
                }
                customView = view;
                customCallback = cb;
                customContainer = new FrameLayout(getActivity());
                customContainer.setBackgroundColor(Color.BLACK);
                customContainer.addView(view, new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
                r.addView(customContainer, new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
                setSystemBars(false);
                refreshBack();
            }

            @Override
            public void onHideCustomView() {
                hideCustom();
            }

            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileLauncher == null) return false;
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = cb;
                try {
                    fileLauncher.launch(params.createIntent());
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        w.setDownloadListener((url, ua, cd, mime, len) -> startDownload(w.getUrl(), url, ua, cd, mime, len));

        w.setVisibility(View.GONE);
        FrameLayout r = root();
        if (r != null) r.addView(w);
        views.put(tabId, w);
        return w;
    }

    // ----------------------------------------------------------- downloads

    private void startDownload(String pageUrl, String url, String ua, String cd, String mime, long len) {
        try {
            if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) {
                JSObject err = new JSObject();
                err.put("message", "\u0647\u0630\u0627 \u0627\u0644\u0646\u0648\u0639 \u0645\u0646 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645 \u0644\u0644\u062A\u0646\u0632\u064A\u0644");
                notifyListeners("downloadError", err);
                return;
            }
            String name = URLUtil.guessFileName(url, cd, mime);
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
            if (mime != null && !mime.isEmpty()) r.setMimeType(mime);
            String cookie = CookieManager.getInstance().getCookie(url);
            if (cookie != null) r.addRequestHeader("Cookie", cookie);
            if (ua != null) r.addRequestHeader("User-Agent", ua);
            if (pageUrl != null) r.addRequestHeader("Referer", pageUrl);
            r.setTitle(name);
            r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "LionBrowser/" + name);
            r.allowScanningByMediaScanner();
            long id = dm.enqueue(r);

            JSObject o = new JSObject();
            o.put("id", String.valueOf(id));
            o.put("fileName", name);
            o.put("mimeType", mime != null ? mime : "");
            o.put("url", url);
            o.put("sizeBytes", len);
            notifyListeners("downloadStarted", o);

            activeDownloads.add(id);
            startPolling();
        } catch (Exception e) {
            JSObject err = new JSObject();
            err.put("message", "\u062A\u0639\u0630\u0651\u0631 \u0628\u062F\u0621 \u0627\u0644\u062A\u0646\u0632\u064A\u0644: " + e.getMessage());
            notifyListeners("downloadError", err);
        }
    }

    private final Runnable pollTask = new Runnable() {
        @Override
        public void run() {
            Iterator<Long> it = activeDownloads.iterator();
            while (it.hasNext()) {
                long id = it.next();
                Cursor c = dm.query(new DownloadManager.Query().setFilterById(id));
                JSObject o = new JSObject();
                o.put("id", String.valueOf(id));
                boolean finished = false;
                try {
                    if (c != null && c.moveToFirst()) {
                        int st = c.getInt(c.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                        long got = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
                        long total = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
                        String status = "downloading";
                        if (st == DownloadManager.STATUS_SUCCESSFUL) {
                            status = "completed";
                            finished = true;
                        } else if (st == DownloadManager.STATUS_FAILED) {
                            status = "failed";
                            finished = true;
                        } else if (st == DownloadManager.STATUS_PAUSED) {
                            status = "paused";
                        }
                        int pct = total > 0 ? (int) Math.min(100, (got * 100) / total) : 0;
                        if (finished && status.equals("completed")) pct = 100;
                        o.put("status", status);
                        o.put("progress", pct);
                        o.put("sizeBytes", total > 0 ? total : got);
                    } else {
                        o.put("status", "failed");
                        finished = true;
                    }
                } finally {
                    if (c != null) c.close();
                }
                notifyListeners("downloadProgress", o);
                if (finished) it.remove();
            }
            if (activeDownloads.isEmpty()) {
                polling = false;
            } else {
                handler.postDelayed(this, 700);
            }
        }
    };

    private void startPolling() {
        if (polling) return;
        polling = true;
        handler.postDelayed(pollTask, 500);
    }

    // ----------------------------------------------------- video detection

    private final Runnable scanTask = new Runnable() {
        @Override
        public void run() {
            scanning = false;
            final WebView w = active();
            if (w == null || !shown) return;
            final String tabId = activeTab;
            String pageUrl = w.getUrl();
            String host = pageUrl != null ? Uri.parse(pageUrl).getHost() : null;
            boolean blocked = host != null
                    && (host.contains("youtube.com") || host.contains("youtu.be") || host.contains("googlevideo.com"));
            if (!blocked) {
                w.evaluateJavascript(SCAN_JS, value -> handleScan(tabId, value));
            }
            scanning = true;
            handler.postDelayed(this, 3000);
        }
    };

    private void startScan() {
        if (scanning) return;
        scanning = true;
        handler.postDelayed(scanTask, 1500);
    }

    private void handleScan(String tabId, String value) {
        try {
            if (value == null || value.equals("null")) return;
            Object o = new JSONTokener(value).nextValue();
            if (!(o instanceof String)) return;
            JSONArray a = new JSONArray((String) o);
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < a.length(); i++) {
                if (i > 0) sb.append('\n');
                sb.append(a.getString(i));
            }
            String joined = sb.toString();
            String prev = lastVideos.get(tabId);
            if (joined.equals(prev == null ? "" : prev)) return;
            lastVideos.put(tabId, joined);
            JSObject e = new JSObject();
            e.put("tabId", tabId);
            e.put("urls", joined);
            notifyListeners("videoFound", e);
        } catch (Exception ignored) {
        }
    }

    // ------------------------------------------------------ plugin methods

    @PluginMethod
    public void activate(final PluginCall call) {
        final String tabId = call.getString("tabId");
        final String url = fixUrl(call.getString("url"));
        final JSObject data = call.getData();
        final boolean desk = call.getBoolean("desktop", false);
        ui(() -> {
            if (tabId == null || tabId.isEmpty()) {
                call.reject("tabId required");
                return;
            }
            readBounds(data);
            WebView w = views.get(tabId);
            boolean isNew = false;
            if (w == null) {
                w = createView(tabId);
                isNew = true;
            }
            setDesktop(tabId, w, desk, false);
            activeTab = tabId;
            shown = true;
            for (Map.Entry<String, WebView> e : views.entrySet()) {
                e.getValue().setVisibility(e.getKey().equals(tabId) ? View.VISIBLE : View.GONE);
            }
            applyBounds(w);
            startScan();
            if (url != null && (isNew || !norm(url).equals(norm(w.getUrl())))) {
                w.loadUrl(url);
            }
            refreshBack();
            call.resolve();
        });
    }

    @PluginMethod
    public void setBounds(final PluginCall call) {
        final JSObject data = call.getData();
        ui(() -> {
            readBounds(data);
            WebView w = active();
            if (w != null && shown) applyBounds(w);
            call.resolve();
        });
    }

    @PluginMethod
    public void loadUrl(final PluginCall call) {
        final String tabId = call.getString("tabId");
        final String url = fixUrl(call.getString("url"));
        ui(() -> {
            WebView w = tabId == null ? null : views.get(tabId);
            if (w == null || url == null) {
                call.reject("invalid tab or url");
                return;
            }
            w.loadUrl(url);
            call.resolve();
        });
    }

    @PluginMethod
    public void show(final PluginCall call) {
        ui(() -> {
            WebView w = active();
            if (w != null) {
                shown = true;
                w.setVisibility(View.VISIBLE);
                applyBounds(w);
                startScan();
            }
            refreshBack();
            call.resolve();
        });
    }

    @PluginMethod
    public void hide(final PluginCall call) {
        ui(() -> {
            shown = false;
            for (WebView w : views.values()) w.setVisibility(View.GONE);
            refreshBack();
            call.resolve();
        });
    }

    @PluginMethod
    public void goBack(final PluginCall call) {
        ui(() -> {
            WebView w = active();
            if (w != null && w.canGoBack()) w.goBack();
            call.resolve();
        });
    }

    @PluginMethod
    public void goForward(final PluginCall call) {
        ui(() -> {
            WebView w = active();
            if (w != null && w.canGoForward()) w.goForward();
            call.resolve();
        });
    }

    @PluginMethod
    public void reload(final PluginCall call) {
        ui(() -> {
            WebView w = active();
            if (w != null) w.reload();
            call.resolve();
        });
    }

    @PluginMethod
    public void stop(final PluginCall call) {
        ui(() -> {
            WebView w = active();
            if (w != null) w.stopLoading();
            call.resolve();
        });
    }

    @PluginMethod
    public void closeTab(final PluginCall call) {
        final String tabId = call.getString("tabId");
        ui(() -> {
            WebView w = tabId == null ? null : views.remove(tabId);
            desktop.remove(tabId);
            if (w != null) {
                FrameLayout r = root();
                if (r != null) r.removeView(w);
                w.stopLoading();
                w.destroy();
            }
            if (tabId != null && tabId.equals(activeTab)) {
                activeTab = null;
                shown = false;
            }
            refreshBack();
            call.resolve();
        });
    }

    @PluginMethod
    public void setDesktopMode(final PluginCall call) {
        final String tabId = call.getString("tabId");
        final boolean enabled = call.getBoolean("enabled", false);
        ui(() -> {
            WebView w = tabId == null ? null : views.get(tabId);
            if (w != null) setDesktop(tabId, w, enabled, true);
            call.resolve();
        });
    }

    @PluginMethod
    public void clearData(final PluginCall call) {
        final boolean cache = call.getBoolean("cache", false);
        final boolean cookies = call.getBoolean("cookies", false);
        final boolean history = call.getBoolean("history", false);
        ui(() -> {
            for (WebView w : views.values()) {
                if (cache) w.clearCache(true);
                if (history) w.clearHistory();
            }
            if (cookies) {
                CookieManager.getInstance().removeAllCookies(null);
                CookieManager.getInstance().flush();
                WebStorage.getInstance().deleteAllData();
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void downloadUrl(final PluginCall call) {
        final String url = call.getString("url");
        ui(() -> {
            if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) {
                call.reject("invalid url");
                return;
            }
            WebView w = active();
            String ua = w != null ? w.getSettings().getUserAgentString() : mobileUa;
            String page = w != null ? w.getUrl() : null;
            String ext = MimeTypeMap.getFileExtensionFromUrl(url);
            String mime = (ext != null && !ext.isEmpty())
                    ? MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext.toLowerCase()) : null;
            startDownload(page, url, ua, null, mime, -1);
            call.resolve();
        });
    }

    @PluginMethod
    public void openDownload(final PluginCall call) {
        final String idStr = call.getString("id");
        ui(() -> {
            try {
                long id = Long.parseLong(idStr);
                Uri uri = dm.getUriForDownloadedFile(id);
                String mime = dm.getMimeTypeForDownloadedFile(id);
                if (uri == null) {
                    call.reject("file not ready");
                    return;
                }
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(uri, mime);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                getActivity().startActivity(i);
                call.resolve();
            } catch (Exception e) {
                call.reject("cannot open: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void cancelDownload(final PluginCall call) {
        final String idStr = call.getString("id");
        ui(() -> {
            try {
                long id = Long.parseLong(idStr);
                dm.remove(id);
                activeDownloads.remove(id);
                call.resolve();
            } catch (Exception e) {
                call.reject("cannot cancel: " + e.getMessage());
            }
        });
    }
}
