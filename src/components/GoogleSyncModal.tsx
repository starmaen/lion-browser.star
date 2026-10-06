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

  // دالة المزامنة ورفع البيانات إلى Google Drive
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(false);

    try {
      const capacitor = (window as any).Capacitor;
      if (capacitor && capacitor.Plugins && capacitor.Plugins.LionDriveSync) {
        // تجميع البيانات المطلوب مزامنتها
        const syncPayload = {
          bookmarks: account.syncBookmarks ? JSON.parse(localStorage.getItem('lion_bookmarks') || '[]') : [],
          history: account.syncHistory ? JSON.parse(localStorage.getItem('lion_history') || '[]') : [],
          tabs: account.syncTabs ? JSON.parse(localStorage.getItem('lion_tabs') || '[]') : [],
          syncedAt: new Date().toISOString()
        };

        // الرفع إلى درايف
        await capacitor.Plugins.LionDriveSync.syncData({
          data: JSON.stringify(syncPayload, null, 2)
        });
      }

      setIsSyncing(false);
      setSyncSuccessMsg(true);
      onUpdateAccount({
        ...account,
        lastSyncedAt: 'الآن مباشرة',
      });
      setTimeout(() => setSyncSuccessMsg(false), 3000);
    } catch (error: any) {
      setIsSyncing(false);
      alert('خطأ أثناء المزامنة: ' + (error?.message || error));
    }
  };

  const toggleOption = (key: keyof GoogleAccount) => {
    onUpdateAccount({
      ...account,
      [key]: !account[key],
    });
  };

  // دالة تسجيل الدخول الحقيقي بحساب Google
  const handleToggleSignIn = async () => {
    if (account.isSignedIn) {
      onUpdateAccount({
        ...account,
        isSignedIn: false,
        name: 'غير مسجل الدخول',
        email: '',
      });
      return;
    }

    try {
      const capacitor = (window as any).Capacitor;
      if (capacitor && capacitor.Plugins && capacitor.Plugins.LionDriveSync) {
        // فتح شاشة تسجيل الدخول الرسمية لجوجل
        const res = await capacitor.Plugins.LionDriveSync.signIn();
        if (res && res.success) {
          onUpdateAccount({
            ...account,
            isSignedIn: true,
            name: res.displayName || 'مستخدم غوغل',
            email: res.email || '',
            lastSyncedAt: 'الآن',
          });

          // استرجاع البيانات السابقة إن وجدت في Google Drive
          const fetchRes = await capacitor.Plugins.LionDriveSync.fetchSyncedData();
          if (fetchRes && fetchRes.found && fetchRes.data) {
            const cloudData = JSON.parse(fetchRes.data);
            if (cloudData.bookmarks) {
              localStorage.setItem('lion_bookmarks', JSON.stringify(cloudData.bookmarks));
            }
            if (cloudData.history) {
              localStorage.setItem('lion_history', JSON.stringify(cloudData.history));
            }
          }
        }
      } else {
        // محاكاة في بيئة المتصفح العادي للكمبيوتر أثناء التطوير
        onUpdateAccount({
          ...account,
          isSignedIn: true,
          name: 'النجم السوري (starsyria)',
          email: 'starsyria2500@gmail.com',
          lastSyncedAt: 'الآن',
        });
      }
    } catch (error: any) {
      alert('فشل تسجيل الدخول: ' + (error?.message || error));
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
                  src={account.avatarUrl || 'https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_512dp.png'}
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
                className="flex items-center justify-center gap-2 bg
