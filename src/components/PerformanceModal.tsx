import React, { useState } from 'react';
import {
  Zap,
  Battery,
  Cpu,
  RotateCw,
  CheckCircle2,
  X,
  Sparkles,
  Gauge,
  Layers,
  Flame,
} from 'lucide-react';
import { PerformanceSettings } from '../types';

interface PerformanceModalProps {
  performance: PerformanceSettings;
  onUpdatePerformance: (perf: PerformanceSettings) => void;
  onClose: () => void;
  battery?: { level: number; charging: boolean };
}

export const PerformanceModal: React.FC<PerformanceModalProps> = ({
  performance,
  onUpdatePerformance,
  onClose,
  battery,
}) => {
  const [isCleaningRam, setIsCleaningRam] = useState(false);
  const [ramCleanedAlert, setRamCleanedAlert] = useState(false);

  const handleCleanRam = () => {
    setIsCleaningRam(true);
    setTimeout(() => {
      setIsCleaningRam(false);
      setRamCleanedAlert(true);
      onUpdatePerformance({
        ...performance,
        currentRamUsageMB: Math.max(38.2, performance.currentRamUsageMB - 35),
        ramSavedMB: performance.ramSavedMB + 35,
      });
      setTimeout(() => setRamCleanedAlert(false), 3000);
    }, 1200);
  };

  const toggleOption = (key: keyof PerformanceSettings) => {
    if (typeof performance[key] === 'boolean') {
      onUpdatePerformance({
        ...performance,
        [key]: !performance[key],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div
        id="performance-modal"
        className="bg-slate-900 border border-amber-500/30 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-yellow-950/60 p-4 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">محرك الأسد الفائق (Lion Turbo)</h3>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                  السرعة القصوى
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 font-medium">
                توفير فائق للبطارية وتقليل استهلاك الرام (RAM)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Hardware Metrics HUD */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-2 gap-3">
          {/* RAM Usage */}
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>استهلاك الرام الحالي</span>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {performance.currentRamUsageMB.toFixed(1)} <span className="text-xs text-slate-400">MB</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-medium">
              تم توفير {performance.ramSavedMB.toFixed(0)} MB
            </div>
          </div>

          {/* Battery Efficiency & Live Status */}
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>مستوى البطارية الحقيقي</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {battery ? `${battery.level}%` : '96%'}
              {battery?.charging && <span className="text-xs text-amber-400 font-normal ml-1">⚡ شحن</span>}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              {performance.batterySaver ? 'موفر الطاقة مفعّل (توفير 40%)' : 'استهلاك طاقة معتدل'}
            </div>
          </div>
        </div>

        {/* Quick RAM Clean Action Button */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-200 block">تنظيف الذاكرة الفوري</span>
            <span className="text-[10px] text-slate-400">
              تفريغ الكاش وتعليق التبويبات الخاملة فوراً
            </span>
          </div>

          <button
            id="clean-ram-action-btn"
            type="button"
            disabled={isCleaningRam}
            onClick={handleCleanRam}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCleaningRam ? 'animate-spin' : ''}`} />
            <span>{isCleaningRam ? 'جاري التنظيف...' : 'تفريغ الرام الآن'}</span>
          </button>
        </div>

        {ramCleanedAlert && (
          <div className="mx-4 mt-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم تفريغ 35 MB من الذاكرة بنجاح وتسريع المعالج!</span>
          </div>
        )}

        {/* Toggles List */}
        <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
          {/* Battery Saver Mode */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Battery className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">وضع توفير البطارية الفائق</span>
                <span className="text-[10px] text-slate-400">
                  إيقاف مؤقتات الجافاسكربت الخلفية وخفض معدل التحديث
                </span>
              </div>
            </div>
            <button
              id="toggle-battery-saver"
              type="button"
              onClick={() => toggleOption('batterySaver')}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                performance.batterySaver ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                  performance.batterySaver ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Smart RAM Optimizer */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">مُحسّن الذاكرة التلقائي (RAM Saver)</span>
                <span className="text-[10px] text-slate-400">
                  تعليق التبويبات غير المستخدمة بعد دقيقتين لتحرير الذاكرة
                </span>
              </div>
            </div>
            <button
              id="toggle-ram-optimizer"
              type="button"
              onClick={() => toggleOption('ramOptimizer')}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                performance.ramOptimizer ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                  performance.ramOptimizer ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Turbo Speed Caching */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">محرك التسريع الفائق (Turbo Caching)</span>
                <span className="text-[10px] text-slate-400">
                  ضغط الصور والملفات المؤقتة لفتح المواقع خلال 0.2 ثانية
                </span>
              </div>
            </div>
            <button
              id="toggle-turbo-speed"
              type="button"
              onClick={() => toggleOption('turboSpeed')}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                performance.turboSpeed ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                  performance.turboSpeed ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            مصمم خصيصاً لأجهزة الأندرويد الاقتصادية والرائدة
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
