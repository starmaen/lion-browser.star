import React, { useState } from 'react';
import {
  Key,
  Lock,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { SavedPassword } from '../types';

interface PasswordManagerModalProps {
  passwords: SavedPassword[];
  onAddPassword: (pwd: SavedPassword) => void;
  onDeletePassword: (id: string) => void;
  onClose: () => void;
}

export const PasswordManagerModal: React.FC<PasswordManagerModalProps> = ({
  passwords,
  onAddPassword,
  onDeletePassword,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newSite, setNewSite] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const toggleVisibility = (id: string) => {
    setVisiblePasswordIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.trim() || !newUser.trim() || !newPassword.trim()) return;

    const pwd: SavedPassword = {
      id: 'pwd-' + Date.now(),
      siteName: newSite.trim(),
      siteUrl: newUrl.trim() || 'https://' + newSite.toLowerCase().replace(/\s+/g, '') + '.com',
      username: newUser.trim(),
      password: newPassword.trim(),
      updatedAt: new Date().toISOString().split('T')[0],
      strength: newPassword.length > 10 ? 'strong' : newPassword.length > 6 ? 'medium' : 'weak',
    };

    onAddPassword(pwd);
    setNewSite('');
    setNewUrl('');
    setNewUser('');
    setNewPassword('');
    setIsAddOpen(false);
  };

  const filteredPasswords = passwords.filter(
    (p) =>
      p.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.siteUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div
        id="password-manager-modal"
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">خزينة كلمات المرور المشفرة</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AES-256 مشفر
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                حفظ وإدارة وتعبئة كلمات السر بأمان ومزامنتها مع حساب غوغل
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

        {/* Toolbar: Search and Add */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في كلمات المرور المحفوظة..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            id="add-password-btn"
            type="button"
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة جديدة</span>
          </button>
        </div>

        {/* Add Form Accordion */}
        {isAddOpen && (
          <form onSubmit={handleAdd} className="p-4 bg-slate-950 border-b border-slate-800 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-bold text-amber-400">إضافة حساب جديد للخزينة:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="اسم الموقع (مثال: فيسبوك أو تويتر)"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                placeholder="الرابط (مثال: x.com)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-sans"
                dir="ltr"
              />
              <input
                type="text"
                required
                placeholder="اسم المستخدم أو البريد الإلكتروني"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-sans"
                dir="ltr"
              />
              <input
                type="password"
                required
                placeholder="كلمة المرور السرية"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-sans"
                dir="ltr"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400"
              >
                حفظ
              </button>
            </div>
          </form>
        )}

        {/* Passwords List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {filteredPasswords.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              لا توجد كلمات مرور مطابقة
            </div>
          ) : (
            filteredPasswords.map((item) => {
              const isVisible = !!visiblePasswordIds[item.id];
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  id={`password-card-${item.id}`}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{item.siteName}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                            item.strength === 'strong'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : item.strength === 'medium'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {item.strength === 'strong' ? 'قوية' : item.strength === 'medium' ? 'متوسطة' : 'ضعيفة'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {item.siteUrl}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeletePassword(item.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    {/* Username */}
                    <div className="flex items-center gap-1 text-slate-300 font-mono">
                      <span className="text-[10px] text-slate-500 font-sans">المستخدم:</span>
                      <span className="truncate max-w-[160px]">{item.username}</span>
                    </div>

                    {/* Password Actions */}
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-amber-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 tracking-wider">
                        {isVisible ? item.password : '••••••••••••'}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleVisibility(item.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title={isVisible ? 'إخفاء' : 'إظهار'}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.password, item.id)}
                        className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition flex items-center gap-1"
                        title="نسخ كلمة السر"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px] font-bold">{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>محمية بتشفير الأجهزة ونظام الحماية الحيوي (Biometric)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
