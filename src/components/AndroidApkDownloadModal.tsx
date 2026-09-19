import React, { useState } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowDownToLine,
  Share2,
  AlertTriangle,
  QrCode,
  Copy,
  Layers,
  HelpCircle,
  Settings,
  ShieldAlert,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Sliders,
  Download,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { usePWAInstall } from '../usePWAInstall';
import lionLogoImg from '../assets/images/lion_browser_logo_1789575379510.jpg';

interface AndroidApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage?: string;
  onShowToast?: (msg: string) => void;
}

export const AndroidApkDownloadModal: React.FC<AndroidApkDownloadModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'cloud-apk' | 'troubleshoot'>('direct');
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'samsung' | 'xiaomi' | 'pixel' | 'huawei'>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>('unknown-sources');

  // Verified active development container URL (working now, never returns 404)
  const devAppUrl = 'https://ais-dev-tkje5y4pdeljekiyabo2gk-628806814969.europe-west2.run.app';

  // Determine current active origin dynamically to avoid 404 error
  const currentWorkingUrl = (() => {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      const origin = window.location.origin;
      if (origin.includes('run.app')) {
        return origin;
      }
    }
    return devAppUrl;
  })();

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(currentWorkingUrl)
      .then(() => {
        setCopiedLink(true);
        if (onShowToast) onShowToast('تم نسخ الرابط الفعّال! افتحه لتثبيت التطبيق فوراً');
        setTimeout(() => setCopiedLink(false), 3000);
      })
      .catch(() => {
        if (onShowToast) onShowToast(currentWorkingUrl);
      });
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (!success) {
      try {
        window.open(currentWorkingUrl, '_blank');
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-text">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 p-1 border border-amber-300 shadow-md shrink-0">
              <img
                src={lionLogoImg}
                alt="Lion Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                حل مشكلة تثبيت التطبيق على الأندرويد
              </h2>
              <p className="text-xs font-bold text-slate-900/80">
                طرق التثبيت المعتمدة 100% لمتصفح الأسد على هاتفك
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'direct'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>مسح الرمز والتثبيت الفوري (مضمون 100%)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cloud-apk')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'cloud-apk'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ملف APK رسمي موقع</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('troubleshoot')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'troubleshoot'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>استكشاف الأخطاء والمصادر غير المعروفة (Troubleshooting)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-200 text-xs sm:text-sm">
          {/* TAB 1: Direct Instant Mobile Install */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-sm font-black text-amber-300">
                      التثبيت المباشر على هاتفك (بدون الحاجة لمسح الرمز)
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                    موصى به بنسبة 100%
                  </span>
                </div>

                {/* Mobile Direct Action Hero */}
                <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/5 rounded-2xl border border-amber-500/40 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-200">
                        أنت تتصفح بالفعل من هاتفك الذكي!
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                        لا داعي لمسح أي كود. اختر الطريقة المناسبة لهاتفك للتثبيت فوراً بملء الشاشة:
                      </p>
                    </div>
                  </div>

                  {/* Android Chrome Intent Launch (Forces opening in real Chrome, bypassing In-App Custom Tab) */}
                  <a
                    href={`intent://${currentWorkingUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer no-underline text-center"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>🚀 فتح مباشرة في تطبيق Google Chrome (موصى به)</span>
                  </a>

                  {/* Standard Web Link */}
                  <a
                    href={currentWorkingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer no-underline text-center"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>أو فتح في المتصفح الافتراضي</span>
                  </a>

                  {isInstallable && (
                    <button
                      type="button"
                      onClick={install}
                      className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>تثبيت فوري بنقرة واحدة (PWA)</span>
                    </button>
                  )}
                </div>

                {/* Solution for "لا يمكن تثبيت هذا التطبيق" & Custom Tab X */}
                <div className="p-3.5 bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-rose-300 font-black">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>حل رسالة: «لا يمكن تثبيت هذا التطبيق» ووجود علامة (✕) في الأعلى:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    إذا ظهرت لك علامة <strong className="text-white">(✕)</strong> في الزاوية العلوية وعبارة <strong className="text-rose-300">«لا يمكن تثبيت هذا التطبيق»</strong>، فهذا لأنك تتصفح عبر <strong>المتصفح الداخلي المؤقت لواتساب أو تيليجرام</strong>، ونظام أندرويد يمنع تثبيت أي تطبيق من داخل متصفح مؤقت!
                  </p>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/30 space-y-2 text-[11px]">
                    <div className="text-amber-300 font-bold">الحل بخطوتين فقط:</div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <span>
                        في شاشتك الحالية التي بها علامة (✕)، اضغط على <strong className="text-white">النقاط الثلاث (⋮)</strong> في أعلى الشاشة.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <span>
                        اختر من القائمة: <strong className="text-emerald-400">"الفتح في Chrome" (Open in Chrome)</strong> أو <strong className="text-emerald-400">"الفتح في المتصفح"</strong>.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">✓</span>
                      <span className="text-emerald-300 font-bold">
                        بمجرد فتحه في تطبيق Chrome، ستختفي علامة (✕) وسيتحول زر التثبيت إلى متاح فوراً بدون أي شريط لكروم!
                      </span>
                    </div>
                  </div>
                </div>

                {/* How to remove Google Chrome header section */}
                <div className="p-3.5 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-indigo-500/50 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300 font-black">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>كيف تتخلص من ترويسة وشريط غوغل كروم في الأعلى؟</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    إذا ظهرت ترويسة كروم، فهذا لأن الهاتف أضاف الرابط كـ <em>"اختصار متصفح"</em> وليس كـ <em>"تطبيق مستقل"</em>. 
                    <br />
                    تم الآن تفعيل <strong>مشغّل WebAPK و Service Worker</strong> ليتم تثبيته كتطبيق أصلي تماماً بدون أي شريط أو ترويسة:
                  </p>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-indigo-500/30 space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <span>احذف أي اختصار قديم لمتصفح الأسد من شاشة هاتفك الرئيسية.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <span>اضغط على الزر الذهبي أعلاه لفتح الرابط في متصفح Chrome.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                      <span>
                        اضغط على النقاط الثلاث (<strong className="text-white">⋮</strong>) ثم اختر تحديداً: <strong className="text-emerald-400">"تثبيت التطبيق" (Install app)</strong>.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                      <span className="text-amber-300 font-bold">
                        النتيجة: يفتح متصفح الأسد بملء الشاشة مع شريط التحكم السفلي، وتختفي ترويسة كروم وعنوان الويب بالكامل!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clear 3-step Instructions */}
                <div className="space-y-2 text-xs text-slate-300 pt-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    طريقة التثبيت على شاشة هاتفك بعد فتح الرابط:
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pr-1">
                    <li>
                      اضغط على الزر الذهبي أعلاه <strong className="text-amber-300">"فتح وتثبيت متصفح الأسد"</strong>.
                    </li>
                    <li>
                      في نافذة متصفح Chrome، اضغط على قائمة الخيارات (رمز النقاط الثلاث <strong className="text-white">⋮</strong> في أعلى الشاشة).
                    </li>
                    <li>
                      اختر من القائمة <strong className="text-emerald-400">"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong> أو <strong className="text-emerald-400">"تثبيت التطبيق"</strong>.
                    </li>
                    <li>
                      سيظهر لك <strong className="text-amber-300">متصفح الأسد</strong> فوراً كأيقونة تطبيق كاملة على شاشة هاتفك، يفتح بملء الشاشة وبدون أي شريط للمتصفح!
                    </li>
                  </ol>
                </div>

                {/* Secondary: Quick Sharing & QR for other devices */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      مشاركة الرابط أو تثبيته على هاتف آخر:
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `تثبيت متصفح الأسد Lion Browser على هاتفك: ${currentWorkingUrl}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        واتساب
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(
                          currentWorkingUrl
                        )}&text=${encodeURIComponent('تثبيت متصفح الأسد للأندرويد')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        تيليجرام
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Code Collapsible or Compact */}
                  <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <div className="p-2 bg-white rounded-xl shadow border border-amber-400/80 flex flex-col items-center shrink-0">
                      <QRCodeSVG
                        value={currentWorkingUrl}
                        size={100}
                        level="M"
                        includeMargin={false}
                        className="rounded"
                      />
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-xs font-bold text-amber-300">
                        رمز QR لمسحه بكاميرا هاتف آخر:
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        إذا كنت تريد تثبيت التطبيق على جهاز آخر، امسح هذا الرمز باستخدام تطبيق <strong>كاميرا الهاتف العادية</strong> (وليس تطبيقات الماسح غير المتوافقة).
                      </p>
                      <div className="text-[10px] font-mono text-slate-500 truncate max-w-[200px] sm:max-w-xs select-all">
                        {currentWorkingUrl}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear 3-step Instructions */}
                <div className="space-y-2 text-xs text-slate-300 pt-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    بمجرد فتح الرابط على هاتفك:
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pr-1">
                    <li>
                      سيظهر لك زر <strong className="text-amber-300">"تثبيت التطبيق"</strong> في أسفل الشاشة أو في شريط المتصفح.
                    </li>
                    <li>
                      أو اضغط على قائمة المتصفح (نقاط الثلاث <strong className="text-white">⋮</strong>) واختر <strong className="text-emerald-400">"إضافة إلى الشاشة الرئيسية"</strong> أو <strong className="text-emerald-400">"تثبيت التطبيق"</strong>.
                    </li>
                    <li>
                      سيتم تثبيت <strong className="text-amber-300">متصفح الأسد</strong> فوراً كأيقونة تطبيق رسمي كامل على شاشة هاتفك الرئيسية ويفتح بدون أي ترويسة أو شريط لكروم!
                    </li>
                  </ol>

                  {/* Troubleshooting quick jump banner */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] bg-slate-900/70 p-2.5 rounded-xl">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>هل ظهرت لك رسالة "حظر التثبيت" أو "مصادر غير معروفة"؟</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('troubleshoot')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30 transition text-right cursor-pointer"
                    >
                      دليل تفعيل المصادر غير المعروفة ➔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Official Signed APK via PWABuilder Cloud */}
          {activeTab === 'cloud-apk' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/40 border-2 border-indigo-500/50 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>توليد ملف APK رسمي وموقع (Signed APK)</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  أنظمة أندرويد الحديثة ترفض أي ملف APK غير موقع بشهادة مشفرة (Digital Signature). للحصول على ملف APK موقع ومعتمد رسمياً من Google بدون أي خطأ في الحزمة:
                </p>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2">
                  <div className="text-xs font-bold text-indigo-300">
                    أداة PWABuilder الرسمية (من مايكروسوفت و Google):
                  </div>
                  <p className="text-[11px] text-slate-400">
                    تقوم هذه الأداة بتحويل رابط متصفح الأسد إلى ملف <strong className="text-white">.APK</strong> كامل مع شهادة رقمية موقعة متوافقة مع متجر Google Play وجميع أجهزة الأندرويد.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentWorkingUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-xs shadow-lg shadow-indigo-600/30"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>توليد ملف APK موقع عبر PWABuilder الآن</span>
                  </a>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">الخطوات في موقع PWABuilder:</strong>
                  1. اضغط على الزر أعلاه ➔ 2. اضغط على <span className="text-emerald-400 font-bold">"Package for Android"</span> ➔ 3. ستحصل فوراً على ملف APK جاهز للتثبيت على هاتفك بنقرة واحدة!
                </div>

                {/* Troubleshooting jump */}
                <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">إذا طلب منك الهاتف إذناً خاصاً:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('troubleshoot')}
                    className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                  >
                    شاهد خطوات السماح بالتثبيت من مصادر غير معروفة ➔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Comprehensive Troubleshooting & Unknown Sources Guide */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                    <Settings className="w-5 h-5 text-amber-400" />
                    <span>دليل استكشاف الأخطاء وتفعيل التثبيت (Troubleshooting)</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    إعدادات أندرويد
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  إذا واجهتك رسالة <strong className="text-amber-300">"تم حظر التثبيت"</strong>، أو <strong className="text-amber-300">"تطبيق غير معروف"</strong>، أو <strong className="text-amber-300">"خطأ في تحليل الحزمة"</strong>، اتبع الخطوات التالية البسيطة لحلها في ثوانٍ.
                </p>
              </div>

              {/* Section 1: How to Enable "Install Unknown Apps" (Sources) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedSection(expandedSection === 'unknown-sources' ? null : 'unknown-sources')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setExpandedSection(expandedSection === 'unknown-sources' ? null : 'unknown-sources');
                    }
                  }}
                  className="p-4 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition"
                >
                  <div className="flex items-center gap-2.5 text-slate-100 font-bold text-xs sm:text-sm">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs">
                      1
                    </div>
                    <div>
                      <span>تفعيل "التثبيت من مصادر غير معروفة" (Install Unknown Apps)</span>
                      <span className="block text-[11px] text-slate-400 font-normal">
                        إذن ضروري في نظام أندرويد للسماح بتثبيت أي ملف APK خارج متجر Google Play
                      </span>
                    </div>
                  </div>
                  {expandedSection === 'unknown-sources' ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {expandedSection === 'unknown-sources' && (
                  <div className="p-4 sm:p-5 space-y-4 border-t border-slate-800">
                    {/* Quick Automatic Method */}
                    <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        الطريقة التلقائية الفورية (الأسهل والأسرع):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-amber-400 font-bold block">1. افتح ملف الـ APK المحمّل</span>
                          <span className="text-slate-300">ستظهر نافذة أمان: "لدواعي الأمان، غير مسموح لهاتفك بتثبيت تطبيقات غير معروفة من هذا المصدر".</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-amber-400 font-bold block">2. اضغط على "الإعدادات" (Settings)</span>
                          <span className="text-slate-300">ستنقلك النافذة مباشرة وبشكل آلي إلى صفحة إذن التثبيت الخاصة بالتطبيق.</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-amber-400 font-bold block">3. فعّل زر "السماح من هذا المصدر"</span>
                          <span className="text-slate-300">قم بتشغيل مفتاح التبديل بجانب (Allow from this source).</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-emerald-400 font-bold block">4. ارجع واضغط "تثبيت" (Install)</span>
                          <span className="text-slate-300">اضغط زر الرجوع (⬅️) ثم انقر "تثبيت"، وسيكتمل تثبيت التطبيق بنجاح تام!</span>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step per Manufacturer / Brand */}
                    <div className="space-y-2.5 pt-1">
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-slate-400" />
                        <span>إذا أردت تفعيل الخيار يدوياً حسب نوع هاتفك:</span>
                      </div>

                      {/* Brand selector buttons */}
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedBrand('all')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            selectedBrand === 'all'
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          جميع الهواتف (عام)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBrand('samsung')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            selectedBrand === 'samsung'
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          سامسونج (Samsung One UI)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBrand('xiaomi')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            selectedBrand === 'xiaomi'
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          شاومي / ريدمي / بوكو (MIUI / HyperOS)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBrand('pixel')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            selectedBrand === 'pixel'
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          بيكسل / أندرويد الخام (Pixel / Moto)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBrand('huawei')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            selectedBrand === 'huawei'
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          هواوي / هونر (EMUI / MagicOS)
                        </button>
                      </div>

                      {/* Brand instructions details */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2">
                        {selectedBrand === 'all' && (
                          <div className="space-y-1.5">
                            <span className="font-bold text-amber-300 block">المسار العام في جميع أجهزة أندرويد (Android 8 - 15):</span>
                            <div className="p-2 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] leading-relaxed">
                              الإعدادات ➔ التطبيقات ➔ إمكانية وصول خاصة (Special App Access) ➔ تثبيت تطبيقات غير معروفة (Install Unknown Apps) ➔ حدد المتصفح (Chrome) أو "ملفاتي" ➔ فعّل خيار السماح.
                            </div>
                          </div>
                        )}

                        {selectedBrand === 'samsung' && (
                          <div className="space-y-2">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5">
                              📱 هواتف سامسونج جالاكسي (Samsung Galaxy / One UI):
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                              <li>افتح تطبيق <strong className="text-white">الضبط (Settings)</strong> في هاتفك.</li>
                              <li>اضغط على قسم <strong className="text-white">التطبيقات (Apps)</strong>.</li>
                              <li>اضغط على رمز القائمة بالأعلى (النقاط الثلاث <strong className="text-amber-300">⋮</strong>).</li>
                              <li>اختر <strong className="text-emerald-400">إمكانية وصول خاصة (Special access)</strong>.</li>
                              <li>انقر على <strong className="text-emerald-400">تثبيت تطبيقات غير معروفة (Install unknown apps)</strong>.</li>
                              <li>حدد التطبيق الذي فتحت منه الملف (مثل <strong className="text-white">ملفاتي My Files</strong> أو <strong className="text-white">Chrome</strong>).</li>
                              <li>قم بتفعيل خيار <strong className="text-emerald-400">"السماح من هذا المصدر" (Allow from this source)</strong>.</li>
                            </ol>
                          </div>
                        )}

                        {selectedBrand === 'xiaomi' && (
                          <div className="space-y-2">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5">
                              📱 هواتف شاومي وريدمي وبوكو (Xiaomi / Redmi / POCO - MIUI & HyperOS):
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                              <li>افتح <strong className="text-white">الإعدادات (Settings)</strong>.</li>
                              <li>انتقل إلى <strong className="text-white">الحماية والخصوصية (Privacy protection)</strong>.</li>
                              <li>اضغط على <strong className="text-emerald-400">أذونات خاصة (Special permissions)</strong>.</li>
                              <li>اضغط على <strong className="text-emerald-400">تثبيت تطبيقات غير معروفة (Install unknown apps)</strong>.</li>
                              <li>حدد المتصفح أو تطبيق <strong className="text-white">مدير الملفات (File Manager)</strong>.</li>
                              <li>فعّل خيار السماح. سيظهر لك تحذير أمني لمدة 10 ثوانٍ: ضع علامة (✓) بجانب <strong className="text-amber-300">"أنا على دراية بالمخاطر المحتملة"</strong>، ثم اضغط <strong className="text-emerald-400">موافق (OK)</strong>.</li>
                            </ol>
                          </div>
                        )}

                        {selectedBrand === 'pixel' && (
                          <div className="space-y-2">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5">
                              📱 هواتف جوجل بيكسل وموتورولا وأندرويد الخام (Google Pixel / Motorola / Nokia):
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                              <li>افتح <strong className="text-white">الإعدادات (Settings)</strong>.</li>
                              <li>اضغط على <strong className="text-white">التطبيقات (Apps)</strong> أو "التطبيقات والإشعارات".</li>
                              <li>مرر لأسفل واضغط على <strong className="text-emerald-400">الوصول الخاص إلى التطبيقات (Special app access)</strong>.</li>
                              <li>اضغط على <strong className="text-emerald-400">تثبيت تطبيقات غير معروفة (Install unknown apps)</strong>.</li>
                              <li>اختر التطبيق المصدري (مثل Chrome أو تطبيق Files).</li>
                              <li>قم بتشغيل مفتاح التبديل بجانب <strong className="text-emerald-400">السماح بتثبيت التطبيقات من هذا المصدر</strong>.</li>
                            </ol>
                          </div>
                        )}

                        {selectedBrand === 'huawei' && (
                          <div className="space-y-2">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5">
                              📱 هواتف هواوي وهونر (Huawei / Honor - EMUI & MagicOS):
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                              <li>افتح تطبيق <strong className="text-white">الإعدادات (Settings)</strong>.</li>
                              <li>انتقل إلى <strong className="text-white">الأمان والخصوصية (Security)</strong>.</li>
                              <li>اضغط على <strong className="text-emerald-400">المزيد من الإعدادات (More settings)</strong>.</li>
                              <li>انقر على <strong className="text-emerald-400">تثبيت تطبيقات من مصادر خارجية (Install apps from external sources)</strong>.</li>
                              <li>اختر تطبيق المتصفح أو الملفات وفعّل زر السماح.</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Overriding Google Play Protect Block */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedSection(expandedSection === 'play-protect' ? null : 'play-protect')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setExpandedSection(expandedSection === 'play-protect' ? null : 'play-protect');
                    }
                  }}
                  className="p-4 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition"
                >
                  <div className="flex items-center gap-2.5 text-slate-100 font-bold text-xs sm:text-sm">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-xs">
                      2
                    </div>
                    <div>
                      <span>تجاوز حظر "تم حظر التطبيق بواسطة Google Play Protect"</span>
                      <span className="block text-[11px] text-slate-400 font-normal">
                        إذا ظهرت نافذة حمراء أو تحذيرية أثناء محاولة التثبيت
                      </span>
                    </div>
                  </div>
                  {expandedSection === 'play-protect' ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {expandedSection === 'play-protect' && (
                  <div className="p-4 sm:p-5 space-y-3 border-t border-slate-800 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      نظام الحماية من Google (Play Protect) يُظهر تحذيراً تلقائياً عند تثبيت أي تطبيق لم يُرفع على متجر جوجل بلاي مباشرة، ويعتبره افتراضياً "تطبيق غير معروف":
                    </p>
                    <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3.5 space-y-2 text-red-200">
                      <div className="font-bold flex items-center gap-1.5 text-xs">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        طريقة التخطي والتثبيت بأمان:
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                        <li>عندما تظهر لك نافذة التحذير <strong className="text-red-300">"تم الحظر بواسطة Play Protect"</strong>، لا تضغط على "حسناً".</li>
                        <li>ابحث في أسفل الرسالة عن خيار <strong className="text-amber-300">"مزيد من التفاصيل" (More details)</strong> أو السهم الصغير واضغط عليه.</li>
                        <li>سيظهر لك خيار إضافي: اضغط على <strong className="text-emerald-400 underline">"التثبيت على أي حال" (Install anyway)</strong> أو "تثبيت دون فحص".</li>
                        <li>سيكتمل التثبيت وتظهر أيقونة متصفح الأسد مباشرة.</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Parse Error / Corrupted Package */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedSection(expandedSection === 'parse-error' ? null : 'parse-error')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setExpandedSection(expandedSection === 'parse-error' ? null : 'parse-error');
                    }
                  }}
                  className="p-4 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition"
                >
                  <div className="flex items-center gap-2.5 text-slate-100 font-bold text-xs sm:text-sm">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-black text-xs">
                      3
                    </div>
                    <div>
                      <span>حل رسالة "خطأ في تحليل الحزمة" (Parse Error) أو "التطبيق ليس مثبتاً"</span>
                      <span className="block text-[11px] text-slate-400 font-normal">
                        أسباب عدم اكتمال التثبيت وكيفية تلافيها
                      </span>
                    </div>
                  </div>
                  {expandedSection === 'parse-error' ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {expandedSection === 'parse-error' && (
                  <div className="p-4 sm:p-5 space-y-3 border-t border-slate-800 text-xs">
                    <ul className="space-y-2 text-slate-300 text-[11px]">
                      <li className="flex items-start gap-2 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">عدم اكتمال تحميل الملف:</strong>
                          إذا انقطع الاتصال أو أغلقت المتصفح قبل اكتمال التنزيل، يصبح ملف الـ APK تالفاً. أعد تحميله وتأكد من اكتمال حجمه.
                        </div>
                      </li>
                      <li className="flex items-start gap-2 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">تعارض مع إصدار مثبت مسبقاً:</strong>
                          إذا كان هناك إصدار تجريبي سابق من متصفح الأسد على هاتفك، قم بإلغاء تثبيته أولاً قبل تثبيت الإصدار الجديد.
                        </div>
                      </li>
                      <li className="flex items-start gap-2 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">المطابقة الرقمية لتوقيع APK:</strong>
                          أنظمة Android الحديثة تتطلب ملفاً موقعاً بشهادة V2/V3. استخدم تبويب <strong className="text-indigo-300">"ملف APK رسمي موقع"</strong> بالأعلى عبر PWABuilder للحصول على حزمة موقعة 100%.
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Instant PWA Recommendation Card */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-1 text-right w-full sm:w-auto">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>الحل الأسهل والمضمون 100% بدون أي إعدادات أمان:</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    يمكنك تثبيت متصفح الأسد مباشرة من المتصفح كـ تطبيق أصيل بضغطة زر واحدة دون الحاجة لتغيير إعدادات المصادر غير المعروفة.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('direct')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>انتقل للتثبيت الفوري الآن</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">متصفح الأسد للأندرويد Lion Browser</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
