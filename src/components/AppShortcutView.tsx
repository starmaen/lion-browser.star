import React, { useState } from 'react';
import {
  ExternalLink,
  Smartphone,
  Layers,
  RotateCw,
  ShieldCheck,
  Share2,
  Bookmark,
  Sparkles,
  Play,
  MessageCircle,
  Send,
  Camera,
  Music2,
  Code2,
  Check,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';
import { QuickShortcut } from '../types';

interface AppShortcutViewProps {
  currentUrl: string;
  onNavigateTo: (url: string, title?: string) => void;
  onOpenStandaloneMode?: (shortcut: QuickShortcut) => void;
  onShowToast?: (msg: string) => void;
  onToggleToIframe: () => void;
  currentLanguage?: string;
}

interface SocialAppProfile {
  id: string;
  name: string;
  nameAr: string;
  domainPattern: string;
  primaryColor: string;
  accentBg: string;
  iconType: 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'telegram' | 'twitter' | 'github' | 'code';
  mobileUrl: string;
  deepLinkUri: string;
  taglineAr: string;
  taglineEn: string;
  instructionsAr: string;
  instructionsEn: string;
}

const KNOWN_SOCIAL_APPS: SocialAppProfile[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    nameAr: 'انستغرام',
    domainPattern: 'instagram.com',
    primaryColor: '#E1306C',
    accentBg: 'from-fuchsia-600 via-rose-500 to-amber-500',
    iconType: 'instagram',
    mobileUrl: 'https://www.instagram.com',
    deepLinkUri: 'instagram://app',
    taglineAr: 'منصة الصور ومقاطع ريلز والقصص اليومية',
    taglineEn: 'Photos, Reels, and Stories Platform',
    instructionsAr: 'يمكنك فتح انستغرام مباشرة داخل المتصفح أو فتحه في التطبيق المثبت على هاتفك للتفاعل ونشر القصص بدون قيود الأمان.',
    instructionsEn: 'You can browse Instagram in the browser or launch the native phone app for full interaction and stories without security restrictions.',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    nameAr: 'فيسبوك',
    domainPattern: 'facebook.com',
    primaryColor: '#1877F2',
    accentBg: 'from-blue-600 to-indigo-600',
    iconType: 'facebook',
    mobileUrl: 'https://m.facebook.com',
    deepLinkUri: 'fb://facewebmodal/f?href=https://m.facebook.com',
    taglineAr: 'منصة التواصل الاجتماعي والأصدقاء والمجموعات',
    taglineEn: 'Social Network, Friends & Groups',
    instructionsAr: 'يوفر متصفح الأسد نسخة فيسبوك المخصصة للأجهزة الذكية (m.facebook.com) لتصفح سريع واقتصادي في بيانات الهاتف والرام.',
    instructionsEn: 'Lion Browser uses the optimized mobile Facebook interface for ultra-fast, data-saving browsing.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    nameAr: 'تيك توك',
    domainPattern: 'tiktok.com',
    primaryColor: '#EE1D52',
    accentBg: 'from-slate-900 via-rose-600 to-cyan-500',
    iconType: 'tiktok',
    mobileUrl: 'https://www.tiktok.com',
    deepLinkUri: 'snssdk1128://',
    taglineAr: 'مقاطع الفيديو القصيرة والإبداعية الرائجة',
    taglineEn: 'Trending Short Videos & Creative Clips',
    instructionsAr: 'شاهد مقاطع تيك توك الرائجة أو افتح التطبيق مباشرة على الهاتف لمتابعة صانعي المحتوى والتصوير.',
    instructionsEn: 'Watch trending short videos or launch the native TikTok app on your phone.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    nameAr: 'واتساب ويب',
    domainPattern: 'whatsapp.com',
    primaryColor: '#25D366',
    accentBg: 'from-emerald-600 to-green-600',
    iconType: 'whatsapp',
    mobileUrl: 'https://web.whatsapp.com',
    deepLinkUri: 'whatsapp://send',
    taglineAr: 'المحادثات الفورية الآمنة والمكالمات المشفرة',
    taglineEn: 'Instant Messaging & End-to-End Encryption',
    instructionsAr: 'استخدم واتساب ويب لمسح رمز الاستجابة السريعة (QR) أو افتح تطبيق واتساب مباشرة على الهاتف للتحدث مع أصدقائك.',
    instructionsEn: 'Link your WhatsApp via QR code or launch your native WhatsApp app directly on your phone.',
  },
  {
    id: 'telegram',
    name: 'Telegram Web',
    nameAr: 'تلغرام ويب',
    domainPattern: 'telegram.org',
    primaryColor: '#229ED9',
    accentBg: 'from-sky-500 to-blue-600',
    iconType: 'telegram',
    mobileUrl: 'https://web.telegram.org',
    deepLinkUri: 'tg://resolve',
    taglineAr: 'القنوات والمجموعات والمحادثات فائقة السرعة والأمان',
    taglineEn: 'Fast & Secure Messaging, Channels & Groups',
    instructionsAr: 'تصفح تلغرام ويب مباشرة أو انتقل لتطبيق تلغرام على هاتفك للاشتراك في القنوات واستقبال الملفات الضخمة.',
    instructionsEn: 'Use Telegram Web or launch your phone app to join channels and transfer large files.',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    nameAr: 'إكس (تويتر)',
    domainPattern: 'x.com',
    primaryColor: '#000000',
    accentBg: 'from-slate-900 to-slate-800',
    iconType: 'twitter',
    mobileUrl: 'https://x.com',
    deepLinkUri: 'twitter://timeline',
    taglineAr: 'الأخبار العاجلة والترند والمحادثات المباشرة حول العالم',
    taglineEn: 'Breaking News, Trends & Real-time Posts',
    instructionsAr: 'تابع الأحداث العالمية والترند العربي عبر إكس، مع حماية متصفح الأسد من أدوات التتبع والإعلانات المتطفلة.',
    instructionsEn: 'Follow world events and trends on X with Lion Browser tracking protection.',
  },
];

export const AppShortcutView: React.FC<AppShortcutViewProps> = ({
  currentUrl,
  onNavigateTo,
  onOpenStandaloneMode,
  onShowToast,
  onToggleToIframe,
  currentLanguage = 'ar',
}) => {
  const isRtl = currentLanguage === 'ar';
  const [iframeKey, setIframeKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'embed' | 'direct'>('embed');

  // Match app from current URL
  const matchedApp: SocialAppProfile =
    KNOWN_SOCIAL_APPS.find((app) => currentUrl.includes(app.domainPattern)) || {
      id: 'custom-app',
      name: 'Web Application',
      nameAr: 'تطبيق الويب',
      domainPattern: currentUrl,
      primaryColor: '#3B82F6',
      accentBg: 'from-blue-600 to-slate-900',
      iconType: 'code',
      mobileUrl: currentUrl,
      deepLinkUri: currentUrl,
      taglineAr: 'تطبيق ويب سريع ومحمي عبر متصفح الأسد',
      taglineEn: 'Fast and protected web application',
      instructionsAr: 'تصفح التطبيق داخل متصفح الأسد بأمان أو افتحه في نافذة مستقلة بضغطة واحدة.',
      instructionsEn: 'Browse this web app securely inside Lion Browser or launch it in a separate tab.',
    };

  const handleLaunchNativeApp = () => {
    try {
      // Try to open native app protocol first
      window.location.href = matchedApp.deepLinkUri;
      setTimeout(() => {
        // Fallback to official web URL in new window if native app didn't capture
        window.open(matchedApp.mobileUrl, '_blank', 'noopener,noreferrer');
      }, 700);
      if (onShowToast) {
        onShowToast(
          isRtl
            ? `جاري فتح ${matchedApp.nameAr} في تطبيق الهاتف أو نافذة جديدة...`
            : `Launching ${matchedApp.name}...`
        );
      }
    } catch {
      window.open(matchedApp.mobileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenStandalone = () => {
    if (onOpenStandaloneMode) {
      onOpenStandaloneMode({
        id: matchedApp.id,
        title: matchedApp.name,
        titleAr: matchedApp.nameAr,
        url: matchedApp.mobileUrl,
        iconName: matchedApp.id,
        bgColor: matchedApp.primaryColor,
        textColor: '#FFFFFF',
        category: 'social',
        isAppShortcut: true,
      });
    } else {
      window.open(matchedApp.mobileUrl, '_blank');
    }
  };

  const renderAppIcon = () => {
    switch (matchedApp.iconType) {
      case 'instagram':
        return <Camera className="w-5 h-5 text-white" />;
      case 'facebook':
        return <span className="font-black text-lg text-white">f</span>;
      case 'tiktok':
        return <Music2 className="w-5 h-5 text-white" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-white" />;
      case 'telegram':
        return <Send className="w-5 h-5 text-white" />;
      case 'twitter':
        return <span className="font-black text-base text-white">𝕏</span>;
      default:
        return <Code2 className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div
      id="app-shortcut-view"
      className="flex-1 w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none"
    >
      {/* App Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-md z-30">
        <div className="flex items-center gap-2.5">
          {/* App Icon Pill */}
          <div
            className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${matchedApp.accentBg} flex items-center justify-center shadow-md`}
          >
            {renderAppIcon()}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white">{isRtl ? matchedApp.nameAr : matchedApp.name}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{isRtl ? 'محمي' : 'Secure'}</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
              {isRtl ? matchedApp.taglineAr : matchedApp.taglineEn}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Open in Native App / External */}
          <button
            type="button"
            onClick={handleLaunchNativeApp}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl transition shadow-md cursor-pointer"
            title={isRtl ? 'تشغيل في تطبيق الهاتف الأصلي' : 'Open in Phone App'}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="font-black">{isRtl ? 'فتح التطبيق 📲' : 'Open App'}</span>
          </button>

          {/* Standalone Window */}
          <button
            type="button"
            onClick={handleOpenStandalone}
            className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer border border-slate-700"
            title={isRtl ? 'فتح في وضع تطبيق مستقل بدون ترويسة' : 'Standalone Mode'}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? 'تطبيق مستقل' : 'Standalone'}</span>
          </button>

          {/* Direct External Tab */}
          <a
            href={matchedApp.mobileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title={isRtl ? 'فتح في علامة تبويب خارجية جديدة' : 'Open in new tab'}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col overflow-hidden relative">
        {/* Helper Notification Banner */}
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-3 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {isRtl ? matchedApp.instructionsAr : matchedApp.instructionsEn}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleToIframe}
            className="text-[11px] font-bold text-amber-400 hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <span>{isRtl ? 'الإطار المباشر' : 'Raw Iframe'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Live In-App Iframe Container with Mobile Web optimized address */}
        <div className="flex-1 w-full relative bg-slate-950 overflow-hidden flex flex-col">
          <iframe
            key={iframeKey}
            id="social-app-iframe"
            src={`/api/proxy?url=${encodeURIComponent(matchedApp.mobileUrl)}`}
            title={matchedApp.name}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            className="w-full flex-1 border-0 bg-white"
          />

          {/* Floating Mobile Launch Overlay Dock */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs max-w-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <div>
                <span className="text-white font-bold block">{isRtl ? matchedApp.nameAr : matchedApp.name}</span>
                <span className="text-[10px] text-slate-400">
                  {isRtl ? 'تصفح آمن وخفيف بدون استهلاك الرام' : 'Fast & secure in-browser view'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title={isRtl ? 'إعادة تحميل' : 'Reload'}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleLaunchNativeApp}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-black transition shadow cursor-pointer text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تشغيل في الهاتف 📲' : 'Open in Phone'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
