package com.starmaen.lionbrowser;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.VpnService;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.wireguard.android.backend.GoBackend;
import com.wireguard.android.backend.Statistics;
import com.wireguard.android.backend.Tunnel;
import com.wireguard.config.Config;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * مدير WireGuard حقيقي: يحفظ إعدادات .conf ويشغّلها عبر VpnService (مكتبة wireguard tunnel).
 * حركة المرور كلها (المتصفح وبقية التطبيقات) تمر عبر النفق فيتغير عنوان IP فعلياً.
 */
@CapacitorPlugin(name = "LionVpn")
public class LionVpnPlugin extends Plugin {

    private static final String PREFS = "lion_vpn";
    private static final String KEY = "configs";
    private static final Pattern NAME_OK = Pattern.compile("^[a-zA-Z0-9_=+.-]{1,15}$");

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private GoBackend backend;
    private LionTunnel activeTunnel;

    private ActivityResultLauncher<Intent> vpnLauncher;
    private PluginCall pendingCall;
    private String pendingName;
    private String pendingText;

    private static class LionTunnel implements Tunnel {
        private final String name;

        LionTunnel(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public void onStateChange(Tunnel.State newState) {
        }
    }

    @Override
    public void load() {
        try {
            vpnLauncher = getActivity().registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        PluginCall call = pendingCall;
                        String name = pendingName;
                        String text = pendingText;
                        pendingCall = null;
                        pendingName = null;
                        pendingText = null;
                        if (call == null) return;
                        if (result.getResultCode() == Activity.RESULT_OK) {
                            startTunnel(call, name, text);
                        } else {
                            call.reject("تم رفض إذن VPN");
                        }
                    });
        } catch (Exception e) {
            vpnLauncher = null;
        }
    }

    // ---------------------------------------------------------------- storage

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private JSONObject loadConfigs() {
        try {
            return new JSONObject(prefs().getString(KEY, "{}"));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    private void storeConfigs(JSONObject o) {
        prefs().edit().putString(KEY, o.toString()).apply();
    }

    private synchronized GoBackend backend() {
        if (backend == null) backend = new GoBackend(getContext().getApplicationContext());
        return backend;
    }

    private static String endpointOf(String conf) {
        Matcher m = Pattern.compile("(?im)^\\s*Endpoint\\s*=\\s*(\\S+)").matcher(conf);
        return m.find() ? m.group(1) : "";
    }

    // ---------------------------------------------------------- plugin methods

    @PluginMethod
    public void listConfigs(final PluginCall call) {
        try {
            JSONObject all = loadConfigs();
            JSONArray arr = new JSONArray();
            Iterator<String> it = all.keys();
            while (it.hasNext()) {
                String name = it.next();
                JSONObject item = new JSONObject();
                item.put("name", name);
                item.put("endpoint", endpointOf(all.optString(name, "")));
                arr.put(item);
            }
            JSObject ret = new JSObject();
            ret.put("configsJson", arr.toString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void saveConfig(final PluginCall call) {
        final String name = call.getString("name");
        final String text = call.getString("config");
        if (name == null || !NAME_OK.matcher(name).matches()) {
            call.reject("الاسم غير صالح: حتى 15 حرفاً إنجليزياً أو أرقاماً أو - _ . = +");
            return;
        }
        if (text == null || text.trim().isEmpty()) {
            call.reject("الإعدادات فارغة");
            return;
        }
        executor.execute(() -> {
            try {
                // تحقق من صحة الإعدادات قبل الحفظ
                Config.parse(new ByteArrayInputStream(text.getBytes(StandardCharsets.UTF_8)));
                JSONObject all = loadConfigs();
                all.put(name, text);
                storeConfigs(all);
                call.resolve();
            } catch (Exception e) {
                call.reject("إعدادات غير صالحة: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void deleteConfig(final PluginCall call) {
        String name = call.getString("name");
        if (name == null) {
            call.reject("name required");
            return;
        }
        JSONObject all = loadConfigs();
        all.remove(name);
        storeConfigs(all);
        call.resolve();
    }

    @PluginMethod
    public void connect(final PluginCall call) {
        final String name = call.getString("name");
        if (name == null) {
            call.reject("name required");
            return;
        }
        final String text = loadConfigs().optString(name, null);
        if (text == null) {
            call.reject("الإعداد غير موجود");
            return;
        }
        getActivity().runOnUiThread(() -> {
            Intent prep = VpnService.prepare(getContext());
            if (prep == null) {
                startTunnel(call, name, text);
            } else if (vpnLauncher == null) {
                call.reject("تعذّر طلب إذن VPN");
            } else {
                pendingCall = call;
                pendingName = name;
                pendingText = text;
                try {
                    vpnLauncher.launch(prep);
                } catch (Exception e) {
                    pendingCall = null;
                    call.reject("تعذّر طلب إذن VPN");
                }
            }
        });
    }

    private void startTunnel(final PluginCall call, final String name, final String text) {
        executor.execute(() -> {
            try {
                Config config = Config.parse(new ByteArrayInputStream(text.getBytes(StandardCharsets.UTF_8)));
                downAll();
                LionTunnel t = new LionTunnel(name);
                backend().setState(t, Tunnel.State.UP, config);
                activeTunnel = t;
                call.resolve();
            } catch (Exception e) {
                String m = e.getMessage();
                call.reject(m == null ? e.toString() : m);
            }
        });
    }

    private void downAll() {
        try {
            Set<String> running = backend().getRunningTunnelNames();
            if (running != null) {
                for (String n : running) {
                    try {
                        backend().setState(new LionTunnel(n), Tunnel.State.DOWN, null);
                    } catch (Exception ignored) {
                    }
                }
            }
        } catch (Exception ignored) {
        }
        activeTunnel = null;
    }

    @PluginMethod
    public void disconnect(final PluginCall call) {
        executor.execute(() -> {
            downAll();
            call.resolve();
        });
    }

    @PluginMethod
    public void status(final PluginCall call) {
        executor.execute(() -> {
            JSObject ret = new JSObject();
            boolean up = false;
            String name = "";
            long rx = 0;
            long tx = 0;
            try {
                Set<String> running = backend().getRunningTunnelNames();
                if (running != null && !running.isEmpty()) {
                    up = true;
                    name = running.iterator().next();
                    LionTunnel t = (activeTunnel != null && activeTunnel.getName().equals(name))
                            ? activeTunnel : new LionTunnel(name);
                    try {
                        Statistics st = backend().getStatistics(t);
                        rx = st.totalRx();
                        tx = st.totalTx();
                    } catch (Exception ignored) {
                    }
                }
            } catch (Exception ignored) {
            }
            ret.put("state", up ? "up" : "down");
            ret.put("name", name);
            ret.put("rx", rx);
            ret.put("tx", tx);
            call.resolve(ret);
        });
    }
}
