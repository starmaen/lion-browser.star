import React, { useState } from 'react';
import {
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Cookie,
  HardDrive,
  Globe,
  Key,
  Flame,
  X,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { ClearDataOptions } from '../types';

interface ClearDataModalProps {
  onClearData: (options: ClearDataOptions) => void;
  onClose: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({
  onClearData,
  onClose,
}) => {
  const [options, setOptions] = useState<ClearDataOptions>({
    history: true,
    cache: true,
    cookies: true,
    downloadsHistory: false,
    formAutoFill: true,
    siteSettings: false,
    timeRange: 'allTime',
  });

  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningSuccess, setCleaningSuccess] = useState(false);

  const handleClean = () => {
    setIsCleaning(true);
    setTimeout(() => {
      onClearData(options);
      setIsCleaning(false);
      setCleaningSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        id="clear-data-modal"
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>مسح بيانات التصفح والكاش</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                  تنظيف شامل
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                حذف السجل، الذاكرة المؤقتة (Cache)، الكوكيز وتفريغ المساحة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[65vh] space-y-4">
          {/* Time range picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>النطاق الزمني للمسح:</span>
            </label>
            <select
              value={options.timeRange}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  timeRange: e.target.value as ClearDataOptions['timeRange'],
                }))
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="lastHour">خلال الساعة الماضية</option>
              <option value="lastDay">خلال آخر 24 ساعة</option>
              <option value="lastWeek">خلال الأسبوع الماضي</option>
              <option value="allTime">جميع الأوقات (مسح كامل وشامل)</option>
            </select>
          </div>

          {/* Options Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block mb-1">
              حدد البيانات المراد تنظيفها:
            </span>

            {/* 1. History */}
            <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">سجل التصفح والمواقع</span>
                  <span className="text-[10px] text-slate-400">مسح كافة عناوين الصفحات المزارة والمسارات</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.history}
                onChange={(e) => setOptions((prev) => ({ ...prev, history: e.target.checked }))}
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            {/* 2. Cache */}
            <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">الذاكرة المؤقتة (Cache)</span>
                  <span className="text-[10px] text-slate-400">تحرير 148 ميغابايت من مساحة الهاتف والرام</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.cache}
                onChange={(e) => setOptions((prev) => ({ ...prev, cache: e.target.checked }))}
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            {/* 3. Cookies */}
            <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">ملفات تعريف الارتباط (Cookies)</span>
                  <span className="text-[10px] text-slate-400">تسجيل الخروج من معظم المواقع وإزالة بيانات التتبع</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.cookies}
                onChange={(e) => setOptions((prev) => ({ ...prev, cookies: e.target.checked }))}
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            {/* 4. Downloads history */}
            <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">سجل التنزيلات</span>
                  <span className="text-[10px] text-slate-400">مسح قائمة التحميلات (تبقى الملفات محفوظة في هاتفك)</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.downloadsHistory}
                onChange={(e) => setOptions((prev) => ({ ...prev, downloadsHistory: e.target.checked }))}
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            {/* 5. AutoFill form */}
            <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">بيانات الملء التلقائي للنماذج</span>
                  <span className="text-[10px] text-slate-400">حذف نصوص وعناوين البحث المحفوظة تلقائياً</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.formAutoFill}
                onChange={(e) => setOptions((prev) => ({ ...prev, formAutoFill: e.target.checked }))}
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              لن يتم حذف كلمات المرور المحفوظة في خزينتك أو قائمة إشاراتك المرجعية (المفضلات).
            </span>
          </div>

          {cleaningSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center justify-center gap-2 font-bold animate-in zoom-in duration-100">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم تنظيف الكاش ومسح السجل وبيانات التصفح بنجاح!</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleClean}
            disabled={isCleaning}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white py-2 px-4 rounded-xl text-xs font-black shadow-lg shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
          >
            {isCleaning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري مسح الكاش والتنظيف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>مسح البيانات المحددة الآن</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
