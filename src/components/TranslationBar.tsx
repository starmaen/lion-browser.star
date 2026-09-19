import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Check,
  RotateCw,
  Copy,
  ExternalLink,
  Volume2,
  Sparkles,
  X,
  Globe
} from 'lucide-react';

interface TranslationBarProps {
  currentUrl: string;
  pageTitle: string;
  onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'الإنجليزية (English)' },
  { code: 'fr', name: 'الفرنسية (Français)' },
  { code: 'de', name: 'الألمانية (Deutsch)' },
  { code: 'tr', name: 'التركية (Türkçe)' },
  { code: 'es', name: 'الإسبانية (Español)' },
  { code: 'ru', name: 'الروسية (Русский)' },
  { code: 'zh', name: 'الصينية (中文)' },
];

export const TranslationBar: React.FC<TranslationBarProps> = ({
  currentUrl,
  pageTitle,
  onClose,
}) => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('ar');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [customText, setCustomText] = useState('');
  const [translatedResult, setTranslatedResult] = useState('');
  const [showFullTranslator, setShowFullTranslator] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quick dictionary simulation for real Arabic phrases
  const sampleTranslations: Record<string, string> = {
    'hello': 'مرحباً',
    'welcome': 'أهلاً وسهلاً بك في متصفح الأسد',
    'download video': 'تنزيل وحفظ مقطع الفيديو',
    'privacy and security': 'الخصوصية والأمان المتقدم',
    'search the web': 'ابحث في الويب بحرية',
    'lion browser': 'متصفح الأسد - تصفح سريع وآمن',
  };

  const handleTranslatePage = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      setIsTranslated(true);
    }, 1000);
  };

  const handleTranslateCustomText = () => {
    if (!customText.trim()) return;
    setIsTranslating(true);
    setTimeout(() => {
      const lower = customText.trim().toLowerCase();
      if (sampleTranslations[lower]) {
        setTranslatedResult(sampleTranslations[lower]);
      } else if (targetLang === 'ar') {
        setTranslatedResult(`[ترجمة فورية باللغة العربية]: ${customText} (تمت الترجمة الآلية بنجاح عبر محرك Lion Translate)`);
      } else {
        setTranslatedResult(`[Translated to English]: ${customText}`);
      }
      setIsTranslating(false);
    }, 600);
  };

  const handleCopy = () => {
    if (!translatedResult) return;
    navigator.clipboard.writeText(translatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="lion-translation-banner"
      className="w-full bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-500/30 p-2 sm:p-3 text-xs z-30 shadow-lg animate-in slide-in-from-top-2 duration-150"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-2">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-100">مترجم Lion الفوري عند الطلب</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded font-mono">
                  Google & DeepL Powered
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                ترجمة صفحات الويب والنصوص المحددة فورياً
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Target Language selector */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">الترجمة إلى:</span>
              <select
                value={targetLang}
                onChange={(e) => {
                  setTargetLang(e.target.value);
                  setIsTranslated(false);
                }}
                className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Translate Page Button */}
            <button
              type="button"
              onClick={handleTranslatePage}
              disabled={isTranslating}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                isTranslated
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
              }`}
            >
              {isTranslating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الترجمة...</span>
                </>
              ) : isTranslated ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تمت ترجمة الصفحة للعربية</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ترجمة الصفحة كاملة</span>
                </>
              )}
            </button>

            {/* Expand Quick Text Box */}
            <button
              type="button"
              onClick={() => setShowFullTranslator(!showFullTranslator)}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer text-[11px] font-bold"
            >
              {showFullTranslator ? 'إخفاء الصندوق' : 'ترجمة نص مخصص'}
            </button>

            {/* Close Bar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Custom Text Translator Drawer */}
        {showFullTranslator && (
          <div className="bg-slate-950/90 border border-blue-500/20 rounded-2xl p-3 mt-1 space-y-2.5 animate-in fade-in duration-100">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>الصق أي نص أو فقرة لترجمتها الفورية بدون مغادرة الصفحة:</span>
              <span className="font-mono text-[10px] text-blue-400">الترجمة من أي لغة ➔ العربية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="اكتب أو الصق النص هنا (مثال: Download video, Privacy, Welcome)..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="text-xs text-slate-200">
                  {translatedResult || (
                    <span className="text-slate-500 italic">ستظهر الترجمة العربية المتقنة هنا...</span>
                  )}
                </div>

                {translatedResult && (
                  <div className="flex items-center justify-end gap-2 mt-2 pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleTranslateCustomText}
                disabled={!customText.trim() || isTranslating}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>ترجمة النص الآن</span>
              </button>
            </div>
          </div>
        )}

        {/* Translation Banner Confirmation Info */}
        {isTranslated && (
          <div className="flex items-center justify-between text-[11px] bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-300">
            <span>✨ تم تفعيل وضع الترجمة العربية على الصفحة تلقائياً مع الحفاظ على التنسيق والوسائط.</span>
            <button
              onClick={() => setIsTranslated(false)}
              className="text-emerald-400 hover:underline font-bold"
            >
              عرض النص الأصلي
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
