import React, { useState } from 'react';
import {
  RotateCw,
  CheckCircle2,
  Bookmark,
  Key,
  History,
  Layers,
  ShieldCheck,
  X,
  LogOut,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { GoogleAccount } from '../types';

interface GoogleSyncModalProps {
  account: GoogleAccount;
  onUpdateAccount: (account: GoogleAccount) => void;
  onClose: () => void;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  account,
  onUpdateAccount,
  onClose,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccessMsg(true);
      onUpdateAccount({
        ...account,
        lastSyncedAt: 'الآن مباشرة',
      });
      setTimeout(() => setSyncSuccessMsg(false), 3000);
    }, 1500);
  };

  const toggleOption = (key: keyof GoogleAccount) => {
    onUpdateAccount({
      ...account,
      [key]: !account[key],
    });
  };

  const handleToggleSignIn = () => {
    if (account.isSignedIn) {
      onUpdateAccount({
        ...account,
        isSignedIn: false,
        name: 'غير مسجل الدخول',
        email: '',
      });
    } else {
      onUpdateAccount({
        ...account,
        isSignedIn: true,
        name: 'النجم السوري (starsyria)',
        email: 'starsyria2500@gmail.com',
        lastSyncedAt: 'الآن',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div
        id="google-sync-modal"
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Google Colorful G Icon */}
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">مزامنة حساب غوغل</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Google Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                مزامنة تلقائية لكلمات المرور والمفضلات والتبويبات
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

        {/* Account Profile Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          {account.isSignedIn ? (
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={account.avatarUrl}
                  alt={account.name}
                  className="w-11 h-11 rounded-full border-2 border-blue-500/50 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-100 block">{account.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {account.email}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
                    آخر مزامنة: {account.lastSyncedAt}
                  </span>
                </div>
              </div>

              <button
                id="google-signout-btn"
                type="button"
                onClick={handleToggleSignIn}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-4 bg-slate-900 rounded-2xl border border-dashed border-slate-700 p-4">
              <p className="text-xs text-slate-300 mb-3">
                لم تسجل الدخول بحساب غوغل بعد. سجّل دخولك لمزامنة كافة بياناتك على جميع أجهزتك!
              </p>
              <button
                id="google-signin-action-btn"
                type="button"
                onClick={handleToggleSignIn}
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs mx-auto shadow-lg transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>تسجيل الدخول باستخدام Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Sync Settings Toggles */}
        <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 mb-1">عناصر المزامنة السحابية:</div>

          {/* Bookmarks */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">الإشارات المرجعية (Bookmarks)</span>
                <span className="text-[10px] text-slate-400">مواقعك المفضلة محفوظة بأمان</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleOption('syncBookmarks')}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                account.syncBookmarks ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                  account.syncBookmarks ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Passwords */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">كلمات المرور وبيانات الدخول</span>
                <span className="text-[10px] text-slate-400">تشفير تام من طرف لطرف</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleOption('syncPasswords')}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                account.syncPasswords ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                  account.syncPasswords ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* History */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">سجل التصفح والبحث</span>
                <span className="text-[10px] text-slate-400">الوصول لصفحاتك السابقة في أي وقت</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleOption('syncHistory')}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                account.syncHistory ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                  account.syncHistory ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Open Tabs */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">التبويبات المفتوحة في الأجهزة الأخرى</span>
                <span className="text-[10px] text-slate-400">متابعة التصفح من حاسوبك أو جهازك اللوحي</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleOption('syncTabs')}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                account.syncTabs ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                  account.syncTabs ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sync Action & Feedback */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            {syncSuccessMsg && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>تمت المزامنة بنجاح!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="trigger-sync-now-btn"
              type="button"
              disabled={isSyncing || !account.isSignedIn}
              onClick={handleSyncNow}
              className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
