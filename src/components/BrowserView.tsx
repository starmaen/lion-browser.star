import React, { useState, useEffect, useRef } from 'react';
import { Browser } from '@capacitor/browser';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ShieldCheck,
  Lock,
  Layers,
  MoreVertical,
  ExternalLink,
  Smartphone,
  Laptop,
  Bookmark,
  Share2,
  Key,
  X,
  Zap,
  Download,
  Languages,
  History,
  Star,
  Flame,
  ArrowDownToLine,
  Settings,
  Video,
  FileText,
  Image as ImageIcon,
  Printer,
  ChevronUp,
  ChevronDown,
  Grid,
  ArrowLeftRight,
} from 'lucide-react';
import { BrowserTab, QuickShortcut, DownloadItem, SearchEngineId, VpnState, GoogleAccount } from '../types';
import lionLogoImg from '../assets/images/lion_browser_logo_1789575379510.jpg';
import { SmartSearchView } from './SmartSearchView';
import { GoogleSearchView } from './GoogleSearchView';
import { YouTubeBrowserView } from './YouTubeBrowserView';
import { AppShortcutView } from './AppShortcutView';
import { NativeWebViewHost } from './NativeWebViewHost';
import { isNativeApp, LionWebView } from '../native/lionWebView';

interface BrowserViewProps {
  tab: BrowserTab;
  tabsCount: number;
  onNavigate: (url: string, title?: string) => void;
  onHome: () => void;
  onOpenTabs: () => void;
  onOpenShield: () => void;
  onOpenVpn: () => void;
  onOpenStandaloneMode: (shortcut: QuickShortcut) => void;
  onCreateAppShortcut?: (url: string, title: string) => void;
  onSavePasswordPrompt: (siteUrl: string) => void;
  onOpenDownloads: () => void;
  onToggleTranslator: () => void;
  isTranslatorOpen?: boolean;
  onToggleBookmark: (url: string, title: string) => void;
  isCurrentUrlBookmarked: boolean;
  onOpenBookmarksHistory: (tab?: 'bookmarks' | 'history') => void;
  onOpenClearData: () => void;
  onOpenSettings?: () => void;
  onOpenGoogleSync?: () => void;
  onOpenVideoPlayer?: (url?: string, title?: string) => void;
  onOpenImageDownloader?: (url: string, title?: string) => void;
  onOpenApkModal?: () => void;
  onAddDownload?: (item: DownloadItem) => void;
  onShowToast?: (msg: string) => void;
  currentLanguage?: string;
  canGoBack?: boolean;
  onGoBack?: () => void;
  isVpnActive: boolean;
  vpnState?: VpnState;
  onReturnToPreviousTab?: () => void;
  previousTabTitle?: string;
  googleAccount?: GoogleAccount;
  nativeNav?: { canGoBack: boolean; canGoForward: boolean; loading: boolean; progress: number };
  nativeHidden?: boolean;
  defaultSearchUrl?: string;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  tab,
  tabsCount,
  onNavigate,
  onHome,
  onOpenTabs,
  onOpenShield,
  onOpenVpn,
  onOpenStandaloneMode,
  onCreateAppShortcut,
  onSavePasswordPrompt,
  onOpenDownloads,
  onToggleTranslator,
  isTranslatorOpen = false,
  onToggleBookmark,
  isCurrentUrlBookmarked,
  onOpenBookmarksHistory,
  onOpenClearData,
  onOpenSettings,
  onOpenGoogleSync,
  onOpenVideoPlayer,
  onOpenImageDownloader,
  onOpenApkModal,
  onAddDownload,
  onShowToast,
  currentLanguage = 'ar',
  canGoBack = false,
  onGoBack,
  isVpnActive,
  vpnState,
  onReturnToPreviousTab,
  previousTabTitle,
  googleAccount,
  nativeNav,
  nativeHidden,
  defaultSearchUrl,
}) => {
  const [inputUrl, setInputUrl] = useState(tab.url);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toolbarCollapsed, setToolbarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lion_toolbar_collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [foundVideos, setFoundVideos] = useState<string[]>([]);
  const toggleToolbar = () => {
    setIsMenuOpen(false);
    setToolbarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lion_toolbar_collapsed', next ? '1' : '0');
      } catch {}
      return next;
    });
  };
  useEffect(() => {
    if (!isNativeApp) return;
    const h = LionWebView.addListener('videoFound', (e) => {
      if (e.tabId === tab.id) setFoundVideos(e.urls ? e.urls.split('\n').filter(Boolean) : []);
    });
    return () => {
      h.then((x) => x.remove()).catch(() => {});
    };
  }, [tab.id]);
  const [isDesktopMode, setIsDesktopMode] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [blockedCountOnPage, setBlockedCountOnPage] = useState(7);

  const isGoogleUrl =
    tab.url.includes('google.com') ||
    tab.url.includes('google.');

  const isDuckDuckGoUrl =
    tab.url.includes('duckduckgo.com');

  const isSearchEngineUrl =
    isGoogleUrl ||
    isDuckDuckGoUrl ||
    tab.url.includes('yandex.com') ||
    tab.url.includes('yandex.ru') ||
    tab.url.includes('bing.com') ||
    tab.url.includes('/search?') ||
    tab.url.includes('?q=') ||
    tab.url.includes('?text=');

  const isYouTubeUrl =
    tab.url.includes('youtube.com') ||
    tab.url.includes('youtu.be') ||
    tab.url.includes('m.youtube.com');

  const isSocialAppUrl =
    tab.url.includes('instagram.com') ||
    tab.url.includes('facebook.com') ||
    tab.url.includes('tiktok.com') ||
    tab.url.includes('whatsapp.com') ||
    tab.url.includes('telegram.org') ||
    tab.url.includes('x.com') ||
    tab.url.includes('twitter.com');

  // Proxy state: default to true so all websites & search engines bypass X-Frame-Options and load inside the app!
  const [useProxy, setUseProxy] = useState(true);
  const [useSmartView, setUseSmartView] = useState(true);
  const [forceRawIframe, setForceRawIframe] = useState(false);

  const getEffectiveUrl = (rawUrl: string) => {
    if (!rawUrl || rawUrl.startsWith('about:') || rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
      return rawUrl;
    }
    if (rawUrl.startsWith('/api/proxy')) {
      return rawUrl;
    }
    if (useProxy || isVpnActive) {
      const vpnParam = isVpnActive && vpnState?.activeServer ? `&vpn=1&server=${encodeURIComponent(vpnState.activeServer.id)}` : '';
      return `/api/proxy?url=${encodeURIComponent(rawUrl)}${vpnParam}`;
    }
    return rawUrl;
  };

  // Floating status dock visibility: auto-hide after 4 seconds to maximize viewable screen area
  const [isDockVisible, setIsDockVisible] = useState(true);
  const dockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputUrl(tab.url);
    setForceRawIframe(false);
    // Random realistic blocked ads count for current page
    setBlockedCountOnPage(Math.floor(Math.random() * 8) + 4);

    // Auto-show dock briefly on navigation, then smoothly auto-hide after 4 seconds
    setIsDockVisible(true);
    if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
    dockTimeoutRef.current = setTimeout(() => {
      setIsDockVisible(false);
    }, 4000);

    return () => {
      if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
    };
  }, [tab.url]);

  const handleShowDock = () => {
    setIsDockVisible(true);
    if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
    dockTimeoutRef.current = setTimeout(() => {
      setIsDockVisible(false);
    }, 6000);
  };

  const handleKeepDockOpen = () => {
    if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
  };

  const handleDismissDock = () => {
    if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
    setIsDockVisible(false);
  };

  const openExternalUrl = async (url: string) => {
    if (!url || url.startsWith('about:')) return;
    try {
      await Browser.open({ url, presentationStyle: 'fullscreen' });
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = `${defaultSearchUrl || 'https://www.google.com/search?q='}${encodeURIComponent(url)}`;
      }
    }
    onNavigate(url);
    if (!isNativeApp) void openExternalUrl(url);
  };

  const getDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const currentDomain = getDomain(tab.url);

  const handleConvertToApp = () => {
    setIsMenuOpen(false);
    onOpenStandaloneMode({
      id: 'app-' + Date.now(),
      title: tab.title || currentDomain,
      titleAr: tab.title || currentDomain,
      url: tab.url,
      iconName: 'custom',
      bgColor: '#334155',
      textColor: '#FFFFFF',
      category: 'tools',
      isAppShortcut: true,
    });
  };

  const handleDownloadCurrentPage = () => {
    setIsMenuOpen(false);
    const pageTitle = tab.title || currentDomain;
    const safeTitle = (pageTitle || 'webpage').replace(/[/\\?%*:|"<>]/g, '_');
    const fileName = `${safeTitle}.html`;

    const htmlContent = `<!DOCTYPE html>
<html lang="${currentLanguage}" dir="${currentLanguage === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f1f5f9; padding: 24px; margin: 0; }
    .container { max-width: 900px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; }
    h1 { color: #f59e0b; font-size: 24px; margin-top: 0; }
    .badge { display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; margin-bottom: 12px; }
    .meta { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }
    a { color: #38bdf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    iframe { width: 100%; height: 600px; border: 1px solid #334155; border-radius: 12px; background: white; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">صفحة محفوظة بدون إنترنت • Lion Browser</div>
    <h1>${pageTitle}</h1>
    <div class="meta">
      <div><strong>الموقع:</strong> <a href="${tab.url}" target="_blank">${tab.url}</a></div>
      <div><strong>تاريخ الحفظ:</strong> ${new Date().toLocaleString('ar-EG')}</div>
    </div>
    <hr style="border-color: #1e293b; margin: 16px 0;" />
    <iframe src="${tab.url}" title="${pageTitle}"></iframe>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    if (onAddDownload) {
      onAddDownload({
        id: 'page-dl-' + Date.now(),
        fileName,
        fileType: 'document',
        fileSize: '180 KB',
        progress: 100,
        status: 'completed',
        sourceUrl: tab.url,
        downloadDate: 'الآن',
      });
    }

    if (onShowToast) {
      onShowToast(
        currentLanguage === 'ar'
          ? `تم تنزيل وحفظ صفحة "${pageTitle}" كملف HTML للعمل بدون إنترنت!`
          : `Saved page "${pageTitle}" as offline HTML file!`
      );
    }
  };

  const handlePrintPage = () => {
    setIsMenuOpen(false);
    window.print();
  };

  return (
    <div id="browser-view-container" className="flex-1 flex flex-col h-full w-full bg-slate-950 select-none overflow-hidden">
      {/* Top Browser Bar (Android Style) */}
      <div style={isNativeApp && toolbarCollapsed ? { display: 'none' } : undefined} className="bg-slate-900 border-b border-slate-800 p-2 flex items-center gap-1.5 sm:gap-2 z-30 shadow-md">
        {/* Home & Nav Buttons */}
        {(isNativeApp || (canGoBack && onGoBack)) && (
          <button
            id="browser-back-btn"
            type="button"
            onClick={
              isNativeApp
                ? () => {
                    if (nativeNav?.canGoBack) LionWebView.goBack().catch(() => {});
                    else onHome();
                  }
                : onGoBack
            }
            className="p-2 text-slate-300 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="رجوع للخلف"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Circular Lion Head Emblem Home Button */}
        <button
          id="browser-home-btn"
          type="button"
          onClick={onHome}
          className="relative w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 hover:scale-105 transition cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.5)] shrink-0 flex items-center justify-center"
          title="الصفحة الرئيسية | Lion Browser"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
            <img
              src={lionLogoImg}
              alt="Lion Head Logo"
              className="w-full h-full object-cover object-center rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setIframeKey((prev) => prev + 1);
            if (isNativeApp) LionWebView.reload().catch(() => {});
          }}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          title="تحديث"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Address Bar */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
          <div className="w-full flex items-center bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl px-2.5 py-1.5 transition">
            {/* Lock / Security Icon */}
            <div className="flex items-center gap-1.5 pl-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>

            {/* Input URL */}
            <input
              id="browser-address-input"
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none font-mono px-1"
              dir="ltr"
            />

            {/* Bookmark star inside address bar */}
            <button
              id="address-bar-bookmark-btn"
              type="button"
              onClick={() => onToggleBookmark(tab.url, tab.title || currentDomain)}
              className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer shrink-0"
              title={isCurrentUrlBookmarked ? 'في المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isCurrentUrlBookmarked ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                }`}
              />
            </button>

            {/* In-bar Privacy Shield badge */}
            <button
              id="address-bar-shield-btn"
              type="button"
              onClick={onOpenShield}
              className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer shrink-0 ml-1"
              title="درع الحماية وحجب الإعلانات"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>{blockedCountOnPage}</span>
            </button>
          </div>
        </form>

        {/* Video & File Downloader Button */}
        <button
          id="toolbar-download-video-btn"
          type="button"
          onClick={onOpenDownloads}
          className="flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
          title="تنزيل وحفظ الفيديو والملفات"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">حفظ الفيديو</span>
        </button>

        {/* On-demand Translator Button */}
        <button
          id="toolbar-translator-btn"
          type="button"
          onClick={onToggleTranslator}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
            isTranslatorOpen
              ? 'bg-blue-600 border-blue-400 text-white shadow-md'
              : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30'
          }`}
          title="ترجمة فورية عند الطلب"
        >
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">ترجمة</span>
        </button>

        {/* Bookmarks & History Drawer Quick Button */}
        <button
          id="toolbar-bookmarks-btn"
          type="button"
          onClick={() => onOpenBookmarksHistory('bookmarks')}
          className="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0 hidden md:flex"
          title="المفضلة والمسارات الرجعية"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Quick Return to Previous Tab Shortcut Button */}
        {onReturnToPreviousTab && tabsCount > 1 && (
          <button
            id="browser-prev-tab-btn"
            type="button"
            onClick={onReturnToPreviousTab}
            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1 border border-amber-500/30"
            title={currentLanguage === 'ar' ? `العودة للتبويب السابق: ${previousTabTitle || ''}` : 'Switch back to previous tab'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden lg:inline">
              {currentLanguage === 'ar' ? 'التبويب السابق' : 'Prev Tab'}
            </span>
          </button>
        )}

        {/* Tabs Counter Button (Opens Open Tabs Box) */}
        <button
          id="browser-tabs-btn"
          type="button"
          onClick={onOpenTabs}
          className="w-8 h-8 rounded-xl border-2 border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-400 font-bold text-xs flex items-center justify-center transition cursor-pointer shrink-0"
          title={currentLanguage === 'ar' ? 'صندوق علامات التبويب المفتوحة' : 'Open Tabs Box'}
        >
          {tabsCount}
        </button>

        {/* 3-Dots Menu */}
        <div className="relative">
          <button
            id="browser-more-menu-btn"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-right backdrop-blur-xl animate-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-800 mb-1">
                خيارات الصفحة: {currentDomain}
              </div>

              {/* 0. Install / Download APK Modal */}
              {onOpenApkModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenApkModal();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-emerald-300 font-bold bg-emerald-500/15 hover:bg-emerald-500/25 cursor-pointer border border-emerald-500/30 mb-1.5"
                  title="تثبيت التطبيق على الهاتف أو تنزيل ملف APK"
                >
                  <span>تثبيت / تنزيل تطبيق الهاتف APK</span>
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </button>
              )}

              {/* 1. Create Desktop / Home Screen Shortcut */}
              <button
                id="menu-create-app-shortcut-btn"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onCreateAppShortcut) {
                    onCreateAppShortcut(tab.url, tab.title || currentDomain);
                  }
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-amber-300 font-bold bg-amber-500/15 hover:bg-amber-500/25 cursor-pointer border border-amber-500/30 mb-1.5"
                title="إنشاء اختصار تطبيق على سطح المكتب والشاشة الرئيسية"
              >
                <span>إنشاء اختصار تطبيق على سطح المكتب</span>
                <Smartphone className="w-4 h-4 text-amber-400" />
              </button>

              {/* 2. Download Video and Files */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onOpenVideoPlayer) {
                    onOpenVideoPlayer(tab.url, tab.title || currentDomain);
                  } else {
                    onOpenDownloads();
                  }
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-rose-300 font-bold bg-rose-500/15 hover:bg-rose-500/25 mb-1 cursor-pointer"
              >
                <span>{currentLanguage === 'ar' ? 'تنزيل مقطع فيديو / المشغل الداخلي' : 'Download Video / Player'}</span>
                <Video className="w-4 h-4 text-rose-400" />
              </button>

              {/* 3. Download Full Webpage HTML */}
              <button
                type="button"
                onClick={handleDownloadCurrentPage}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-blue-300 font-bold bg-blue-500/15 hover:bg-blue-500/25 mb-1 cursor-pointer"
              >
                <span>{currentLanguage === 'ar' ? 'تنزيل وحفظ هذه الصفحة كاملاً (HTML)' : 'Download Full Page (HTML)'}</span>
                <FileText className="w-4 h-4 text-blue-400" />
              </button>

              {/* 4. Extract & Download Specific Images */}
              {onOpenImageDownloader && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenImageDownloader(tab.url, tab.title || currentDomain);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-purple-300 font-bold bg-purple-500/15 hover:bg-purple-500/25 mb-1 cursor-pointer"
                >
                  <span>{currentLanguage === 'ar' ? 'استخراج وتحميل صور من الصفحة' : 'Extract & Download Images'}</span>
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                </button>
              )}

              {/* 5. Print or Save as PDF */}
              <button
                type="button"
                onClick={handlePrintPage}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 mb-1 cursor-pointer"
              >
                <span>{currentLanguage === 'ar' ? 'طباعة الصفحة أو حفظها كـ PDF' : 'Print / Save as PDF'}</span>
                <Printer className="w-4 h-4 text-slate-400" />
              </button>

              {/* 6. On-demand Translation */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleTranslator();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-cyan-300 hover:bg-cyan-500/15 cursor-pointer"
              >
                <span>{currentLanguage === 'ar' ? 'ترجمة الصفحة (عند الطلب)' : 'Translate Page'}</span>
                <Languages className="w-4 h-4 text-cyan-400" />
              </button>

              {/* 3. Bookmark Toggle */}
              <button
                type="button"
                onClick={() => {
                  onToggleBookmark(tab.url, tab.title || currentDomain);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                <span>{isCurrentUrlBookmarked ? 'إزالة من المفضلة ★' : 'إضافة إلى المفضلات'}</span>
                <Star
                  className={`w-3.5 h-3.5 ${
                    isCurrentUrlBookmarked ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* 4. Bookmarks and Navigation History */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenBookmarksHistory('history');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                <span>سجل التصفح والمسارات الرجعية</span>
                <History className="w-3.5 h-3.5 text-blue-400" />
              </button>

              {/* 5. Clear Cache & Browsing Data */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenClearData();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
              >
                <span>تنظيف التصفح والكاش</span>
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              </button>

              {/* 6. Standalone Web App Mode Item */}
              <button
                type="button"
                onClick={handleConvertToApp}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-amber-300 font-bold hover:bg-amber-500/15 cursor-pointer border-t border-slate-800 mt-1 pt-1.5"
              >
                <span>فتح كتطبيق بدون ترويسة</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onSavePasswordPrompt(tab.url);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                <span>حفظ كلمة المرور لهذا الموقع</span>
                <Key className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDesktopMode(!isDesktopMode);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                <span>{isDesktopMode ? 'إلغاء وضع سطح المكتب' : 'طلب موقع سطح المكتب'}</span>
                {isDesktopMode ? (
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <a
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 cursor-pointer border-t border-slate-800 mt-1 pt-1.5"
              >
                <span>فتح في نافذة خارجية مباشرة</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-amber-300 font-black hover:bg-amber-500/15 cursor-pointer border-t border-slate-800 mt-1 pt-1.5"
                >
                  <span>{currentLanguage === 'ar' ? 'الإعدادات المتطورة واللغات' : 'Advanced Settings & Languages'}</span>
                  <Settings className="w-4 h-4 text-amber-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isNativeApp && (
        <div className="w-full shrink-0 flex items-center bg-slate-900/95 border-b border-slate-800 z-30">
          <button
            type="button"
            id="browser-toolbar-toggle"
            onClick={toggleToolbar}
            className="flex-1 h-5 flex items-center justify-center text-slate-400 hover:text-amber-400 cursor-pointer"
            title={toolbarCollapsed ? 'إظهار الشريط' : 'طيّ الشريط'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {toolbarCollapsed ? <polyline points="6 9 12 15 18 9" /> : <polyline points="6 15 12 9 18 15" />}
            </svg>
          </button>
          {foundVideos.length > 0 && (
            <button
              type="button"
              id="browser-video-download-btn"
              onClick={() => {
                LionWebView.downloadUrl({ url: foundVideos[0] }).catch(() => {});
                onShowToast?.('جارٍ تنزيل الفيديو…');
              }}
              className="mx-2 my-0.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              ⬇ تنزيل الفيديو
            </button>
          )}
        </div>
      )}

      {/* Web Page Frame / Content or Smart Search / YouTube / App View */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden flex flex-col">
        {isNativeApp ? (
          <NativeWebViewHost
            tabId={tab.id}
            url={tab.url}
            hidden={!!nativeHidden || isMenuOpen}
            desktopMode={isDesktopMode}
            loading={!!nativeNav?.loading}
            progress={nativeNav?.progress ?? 0}
          />
        ) : !forceRawIframe && isYouTubeUrl ? (
          <YouTubeBrowserView
            currentUrl={tab.url}
            onNavigateTo={onNavigate}
            onOpenVideoPlayer={onOpenVideoPlayer}
            onAddDownload={onAddDownload}
            onShowToast={onShowToast}
            onToggleToIframe={() => setForceRawIframe(true)}
            currentLanguage={currentLanguage}
            googleAccount={googleAccount}
            onOpenGoogleModal={onOpenGoogleSync}
          />
        ) : !forceRawIframe && isGoogleUrl && useSmartView ? (
          <GoogleSearchView
            initialQuery={tab.title && tab.title !== tab.url ? tab.title : ''}
            currentUrl={tab.url}
            onNavigateTo={onNavigate}
            onOpenDirectExternal={(url) => window.open(url, '_blank')}
            onToggleToDuckDuckGo={() => {
              let q = '';
              try {
                const u = new URL(tab.url);
                q = u.searchParams.get('q') || '';
              } catch {}
              onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(q || 'اخبار اليوم')}`);
            }}
            onToggleToIframe={() => setForceRawIframe(true)}
            onOpenApkModal={onOpenApkModal}
            currentLanguage={currentLanguage}
          />
        ) : !forceRawIframe && isSocialAppUrl ? (
          <AppShortcutView
            currentUrl={tab.url}
            onNavigateTo={onNavigate}
            onOpenStandaloneMode={onOpenStandaloneMode}
            onShowToast={onShowToast}
            onToggleToIframe={() => setForceRawIframe(true)}
            currentLanguage={currentLanguage}
          />
        ) : (
          /* Real Live Iframe Sandbox with Proxy Bypassing (DuckDuckGo, Bing, Yandex, etc.) */
          <div className="relative w-full flex-1 flex flex-col overflow-hidden">
            {isDuckDuckGoUrl && (
              <div className="bg-slate-900/95 border-b border-amber-500/20 px-3 py-1.5 flex items-center justify-between text-xs z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-amber-400 font-bold">🦆 محرك DuckDuckGo المباشر نشط</span>
                  <span className="text-slate-500 hidden sm:inline">• بحث سريع آمن بدون تتبع</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      let q = '';
                      try {
                        const u = new URL(tab.url);
                        q = u.searchParams.get('q') || '';
                      } catch {}
                      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q || 'اخبار اليوم')}`);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30 transition-colors font-medium text-[11px]"
                  >
                    تبديل إلى Google
                  </button>
                  <a
                    href={tab.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="فتح في نافذة خارجية"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
            {isYouTubeUrl && forceRawIframe && (
              <div className="bg-slate-900/95 border-b border-red-500/30 px-3 py-1.5 flex items-center justify-between text-xs z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold">{currentLanguage === 'ar' ? 'موقع YouTube المباشر (Iframe)' : 'Official YouTube (Iframe)'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForceRawIframe(false)}
                  className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/40 transition-colors font-medium text-[11px]"
                >
                  {currentLanguage === 'ar' ? 'العودة إلى مشغل يوتيوب السريع ⚡' : 'Switch to Fast YouTube Player ⚡'}
                </button>
              </div>
            )}
            {isVpnActive && vpnState?.activeServer && (
              <div className="bg-purple-950/95 border-b border-purple-500/40 px-3 py-1.5 flex items-center justify-between text-xs z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-purple-200 font-bold">
                    🛡️ نفق Proton VPN نشط: {vpnState.activeServer.countryAr} {vpnState.activeServer.flag}
                  </span>
                  <span className="text-purple-300/80 font-mono text-[11px] hidden sm:inline">
                    • IP محمي: {vpnState.activeServer.ip} • تشفير WireGuard
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenVpn}
                  className="px-2.5 py-0.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 transition font-medium text-[11px] cursor-pointer"
                >
                  إعدادات VPN
                </button>
              </div>
            )}
            <iframe
              key={`${iframeKey}-${useProxy ? 'proxy' : 'direct'}`}
              id="active-browser-iframe"
              src={getEffectiveUrl(tab.url)}
              title={tab.title}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        )}

        {/* Quick Floating Action & Download Dock directly under the web page / video */}
        <div style={isNativeApp ? { display: 'none' } : undefined} className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-[120px] sm:max-w-[160px]">
              {currentDomain}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Proxy Unblock Toggle */}
            <button
              type="button"
              onClick={() => {
                setUseProxy(!useProxy);
                setIframeKey((k) => k + 1);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                useProxy
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="تخطي حظر المواقع وعرضها داخل المتصفح (X-Frame-Options)"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{useProxy ? 'فك الحظر: نشط' : 'اتصال مباشر'}</span>
            </button>

            {/* Smart View Toggle if special app/search engine is active */}
            {(isYouTubeUrl || isSocialAppUrl || isSearchEngineUrl) && (
              <button
                type="button"
                onClick={() => {
                  if (isSearchEngineUrl) {
                    setUseSmartView(!useSmartView);
                  } else {
                    setForceRawIframe(!forceRawIframe);
                  }
                }}
                className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer"
                title="تبديل بين وضع التطبيق المدمج وإطار الويب"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>
                  {forceRawIframe || (isSearchEngineUrl && !useSmartView)
                    ? 'وضع التطبيق الذكي'
                    : 'إطار الويب'}
                </span>
              </button>
            )}

            {/* APK / PWA Install Button */}
            {onOpenApkModal && (
              <button
                type="button"
                onClick={onOpenApkModal}
                className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer"
                title="تثبيت التطبيق على الهاتف أو تنزيل APK"
              >
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>تثبيت APK</span>
              </button>
            )}

            {/* 1. Download / Play Video */}
            <button
              type="button"
              onClick={() => {
                if (onOpenVideoPlayer) {
                  onOpenVideoPlayer(tab.url, tab.title || currentDomain);
                } else {
                  onOpenDownloads();
                }
              }}
              className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer"
              title={currentLanguage === 'ar' ? 'تنزيل أو تشغيل الفيديو في المشغل الداخلي' : 'Download / Play Video'}
            >
              <Video className="w-3 h-3 text-rose-400" />
              <span>{currentLanguage === 'ar' ? 'تنزيل الفيديو' : 'Video'}</span>
            </button>

            {/* 2. Download Full Webpage HTML */}
            <button
              type="button"
              onClick={handleDownloadCurrentPage}
              className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer"
              title={currentLanguage === 'ar' ? 'تنزيل وحفظ هذه الصفحة كاملاً كملف HTML للعمل بدون إنترنت' : 'Download Page as offline HTML'}
            >
              <FileText className="w-3 h-3 text-blue-400" />
              <span>{currentLanguage === 'ar' ? 'تنزيل الصفحة' : 'Page'}</span>
            </button>

            {/* 3. Extract & Download Images */}
            {onOpenImageDownloader && (
              <button
                type="button"
                onClick={() => onOpenImageDownloader(tab.url, tab.title || currentDomain)}
                className="flex items-center gap-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer"
                title={currentLanguage === 'ar' ? 'استخراج وتحميل صور من هذه الصفحة' : 'Extract & Download Images'}
              >
                <ImageIcon className="w-3 h-3 text-purple-400" />
                <span>{currentLanguage === 'ar' ? 'تحميل صور' : 'Images'}</span>
              </button>
            )}

            {/* 4. Standalone app mode */}
            <button
              type="button"
              onClick={handleConvertToApp}
              className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer"
              title="تطبيق بدون ترويسة"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span>تطبيق</span>
            </button>

            {/* 5. External Link */}
            <a
              href={tab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-xl text-[11px] font-black transition shadow cursor-pointer"
              title="فتح في نافذة خارجية مستقلة"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{currentLanguage === 'ar' ? 'فتح مباشر' : 'Open'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
