import React from 'react';
import {
  Shield,
  ShieldCheck,
  Zap,
  Battery,
  HardDrive,
  EyeOff,
  Lock,
  X,
  Check,
  Flame,
} from 'lucide-react';
import { PrivacyStats } from '../types';

interface PrivacyShieldModalProps {
  stats: PrivacyStats;
  onToggleAdBlock: () => void;
  onToggleTrackers: () => void;
  onToggleFingerprint: () => void;
  onToggleStrictHttps: () => void;
  onClose: () => void;
}

export const PrivacyShieldModal: React.FC<PrivacyShieldModalProps> = ({
  stats,
  onToggleAdBlock,
  onToggleTrackers,
  onToggleFingerprint,
  onToggleStrictHttps,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div
        id="privacy-shield-modal"
        className="bg-slate-900 border border-amber-500/30 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 p-4 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>درع الأسد لحماية الخصوصية</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                  نشط
                </span>
              </h3>
              <p className="text-[11px] text-amber-300/80 font-medium">
                حجب إعلانات فائق السرعة وحظر متتبعات الشركات
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

        {/* Live Counters Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xl font-black text-amber-400 font-mono">
              {stats.adsBlocked.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">إعلان محجوب</div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xl font-black text-orange-400 font-mono">
              {stats.trackersBlocked.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">متتبع تم إيقافه</div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xl font-black text-emerald-400 font-mono">
              {stats.dataSavedMB} MB
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">بيانات تم توفيرها</div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xl font-black text-cyan-400 font-mono">
              +{stats.estimatedBatterySavedPercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">توفير البطارية</div>
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
          {/* AdBlock Toggle */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  مانع الإعلانات المزعجة والفيديوهات التلقائية
                </span>
                <span className="text-[10px] text-slate-400">
                  يزيل إعلانات يوتيوب والنوافذ المنبثقة والبنرات الثقيلة
                </span>
              </div>
            </div>
            <button
              id="toggle-adblock-btn"
              type="button"
              onClick={onToggleAdBlock}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                stats.adBlockActive ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                  stats.adBlockActive ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Tracker Blocker */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  حظر ملفات التتبع والـ Cookies التجسسية
                </span>
                <span className="text-[10px] text-slate-400">
                  منع فيسبوك وغوغل والشبكات الإعلانية من تتبع سجل نشاطك
                </span>
              </div>
            </div>
            <button
              id="toggle-trackers-btn"
              type="button"
              onClick={onToggleTrackers}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                stats.trackerBlockActive ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                  stats.trackerBlockActive ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Fingerprint Shield */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  حماية بصمة المتصفح (Anti-Fingerprinting)
                </span>
                <span className="text-[10px] text-slate-400">
                  إخفاء مواصفات جهاز الأندرويد والخطوط لمنع التعرف عليك
                </span>
              </div>
            </div>
            <button
              id="toggle-fingerprint-btn"
              type="button"
              onClick={onToggleFingerprint}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                stats.fingerprintShieldActive ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                  stats.fingerprintShieldActive ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Strict HTTPS */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  ترقية الاتصال المشفر دائماً (HTTPS Everywhere)
                </span>
                <span className="text-[10px] text-slate-400">
                  إجبار جميع المواقع على التشفير الآمن لحماية كلمات المرور
                </span>
              </div>
            </div>
            <button
              id="toggle-https-btn"
              type="button"
              onClick={onToggleStrictHttps}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                stats.strictHttpsActive ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                  stats.strictHttpsActive ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            حماية كاملة وفورية بدون أي بطء
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition cursor-pointer text-xs"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
