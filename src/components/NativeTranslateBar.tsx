import React, { useState } from 'react';
import { isTranslatedUrl, toTranslateUrl, fromTranslateUrl } from '../native/translate';

interface Props {
  currentUrl: string;
  onTranslate: (url: string) => void;
  onClose: () => void;
}

const LANGS: { code: string; name: string }[] = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ru', name: 'Русский' },
  { code: 'fa', name: 'فارسی' },
  { code: 'ur', name: 'اردو' },
  { code: 'zh-CN', name: '中文' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'id', name: 'Indonesia' },
];

export const NativeTranslateBar: React.FC<Props> = ({ currentUrl, onTranslate, onClose }) => {
  const [lang, setLang] = useState<string>(() => {
    try {
      return localStorage.getItem('lion_translate_lang') || 'ar';
    } catch {
      return 'ar';
    }
  });
  const isWeb = /^https?:\/\//i.test(currentUrl);
  const translated = isWeb && isTranslatedUrl(currentUrl);

  const choose = (code: string) => {
    setLang(code);
    try {
      localStorage.setItem('lion_translate_lang', code);
    } catch {}
  };

  const translate = () => {
    if (!isWeb) return;
    try {
      const original = translated ? fromTranslateUrl(currentUrl) : currentUrl;
      onTranslate(toTranslateUrl(original, lang));
    } catch {
      onClose();
    }
  };

  const showOriginal = () => {
    try {
      onTranslate(fromTranslateUrl(currentUrl));
    } catch {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-2xl mx-auto bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 pb-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-amber-400">ترجمة الصفحة</h3>
          <button type="button" onClick={onClose} className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
            إغلاق
          </button>
        </div>

        {!isWeb ? (
          <p className="text-xs text-slate-400">افتح صفحة ويب أولاً ثم اضغط زر الترجمة.</p>
        ) : (
          <>
            <p className="text-[11px] text-slate-400 mb-2">
              {translated ? 'الصفحة مترجمة الآن. اختر لغة أخرى أو ارجع للأصل.' : 'اختر اللغة التي تريد الترجمة إليها:'}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => choose(l.code)}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    lang === l.code
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={translate}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-black"
              >
                ترجمة الصفحة
              </button>
              {translated && (
                <button
                  type="button"
                  onClick={showOriginal}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-100 text-sm font-bold border border-slate-700"
                >
                  عرض الأصل
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-3">
              الترجمة عبر خدمة ترجمة غوغل. بعض المواقع (غوغل، يوتيوب، البنوك) لا تدعمها.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
