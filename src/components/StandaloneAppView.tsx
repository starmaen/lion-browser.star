import React, { useState } from 'react';
import {
  X,
  RotateCw,
  ExternalLink,
  Minimize2,
  Maximize2,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { QuickShortcut } from '../types';
import lionLogoImg from '../assets/images/lion_browser_logo_1789575379510.jpg';
import { YouTubeBrowserView } from './YouTubeBrowserView';
import { AppShortcutView } from './AppShortcutView';
import { GoogleSearchView } from './GoogleSearchView';

interface StandaloneAppViewProps {
  app: QuickShortcut;
  onClose: () => void;
  onOpenInBrowser: (url: string) => void;
}

export const StandaloneAppView: React.FC<StandaloneAppViewProps> = ({
  app,
  onClose,
  onOpenInBrowser,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [hasIframeError, setHasIframeError] = useState(false);
  const [forceRawIframe, setForceRawIframe] = useState(false);

  const isGoogleUrl =
    app.url.includes('google.com') ||
    app.url.includes('google.');

  const isYouTubeUrl =
    app.url.includes('youtube.com') ||
    app.url.includes('youtu.be') ||
    app.url.includes('m.youtube.com');

  const isSocialAppUrl =
    app.url.includes('instagram.com') ||
    app.url.includes('facebook.com') ||
    app.url.includes('tiktok.com') ||
    app.url.includes('whatsapp.com') ||
    app.url.includes('telegram.org') ||
    app.url.includes('x.com') ||
    app.url.includes('twitter.com');

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      id="standalone-app-container"
      className="fixed inset-0 z-40 bg-slate-950 flex flex-col select-none overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Mini App Bar (Without browser address bar / header!) */}
      <div className="bg-slate-950/90 backdrop-blur-md px-3 py-2 border-b border-slate-800/80 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <button
            id="close-standalone-app-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition flex items-center gap-1 text-xs font-bold"
            title="الرجوع للمتصفح"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">إغلاق التطبيق</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800"></div>

          {/* Circular Lion Head Emblem */}
          <div className="relative w-6 h-6 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-amber-600 shadow-sm flex items-center justify-center shrink-0">
            <img
              src={lionLogoImg}
              alt="Lion Emblem"
              className="w-full h-full object-cover object-center rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-200">{app.titleAr}</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded border border-amber-500/30">
              تطبيق مستقل
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="إعادة تحميل"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onOpenInBrowser(app.url)}
            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition flex items-center gap-1 text-xs"
            title="فتح مع ترويسة المتصفح"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden md:inline text-[11px]">فتح في المتصفح</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Web View Frame (NO BROWSER HEADER) */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden flex flex-col">
        {!forceRawIframe && isYouTubeUrl ? (
          <YouTubeBrowserView
            currentUrl={app.url}
            onNavigateTo={(url) => onOpenInBrowser(url)}
            onToggleToIframe={() => setForceRawIframe(true)}
            currentLanguage="ar"
          />
        ) : !forceRawIframe && isGoogleUrl ? (
          <GoogleSearchView
            initialQuery={app.titleAr || app.title || ''}
            currentUrl={app.url}
            onNavigateTo={(url) => onOpenInBrowser(url)}
            onOpenDirectExternal={(url) => window.open(url, '_blank')}
            onToggleToIframe={() => setForceRawIframe(true)}
            currentLanguage="ar"
          />
        ) : !forceRawIframe && isSocialAppUrl ? (
          <AppShortcutView
            currentUrl={app.url}
            onNavigateTo={(url) => onOpenInBrowser(url)}
            onToggleToIframe={() => setForceRawIframe(true)}
            currentLanguage="ar"
          />
        ) : (
          <iframe
            key={iframeKey}
            id="standalone-app-iframe"
            src={`/api/proxy?url=${encodeURIComponent(app.url)}`}
            title={app.title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            className="w-full flex-1 border-0 bg-white"
            onError={() => setHasIframeError(true)}
          />
        )}

        {/* Floating Quick Action Overlay if user wants to open directly in a new tab */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs max-w-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-slate-300 font-medium truncate max-w-[200px]">
              {app.titleAr} يعمل بدون ترويسة
            </span>
          </div>

          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold transition shadow"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح مباشر</span>
          </a>
        </div>
      </div>
    </div>
  );
};
