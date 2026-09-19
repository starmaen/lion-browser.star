import React, { useState } from 'react';
import {
  Youtube,
  Instagram,
  Facebook,
  Send,
  MessageCircle,
  Music2,
  Twitter,
  Github,
  Smartphone,
  Code2,
  Plus,
  ExternalLink,
  Layers,
  MoreVertical,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { QuickShortcut } from '../types';

interface QuickShortcutsProps {
  shortcuts: QuickShortcut[];
  onOpenShortcut: (shortcut: QuickShortcut, asStandaloneApp: boolean) => void;
  onAddShortcut: (newShortcut: QuickShortcut) => void;
  onRemoveShortcut: (id: string) => void;
}

export const QuickShortcuts: React.FC<QuickShortcutsProps> = ({
  shortcuts,
  onOpenShortcut,
  onAddShortcut,
  onRemoveShortcut,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 sm:w-6 sm:h-6' };
    switch (iconName) {
      case 'youtube':
        return <Youtube {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />;
      case 'instagram':
        return <Instagram {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />;
      case 'facebook':
        return <Facebook {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />;
      case 'send':
        return <Send {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />;
      case 'message-circle':
        return <MessageCircle {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />;
      case 'music-2':
        return <Music2 {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />;
      case 'twitter':
        return <Twitter {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-slate-100" />;
      case 'github':
        return <Github {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-slate-100" />;
      case 'smartphone':
        return <Smartphone {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />;
      case 'code-2':
        return <Code2 {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      default:
        return <ExternalLink {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const shortcut: QuickShortcut = {
      id: 'custom-' + Date.now(),
      title: newTitle.trim(),
      titleAr: newTitle.trim(),
      url: formattedUrl,
      iconName: 'custom',
      bgColor: '#334155',
      textColor: '#FFFFFF',
      category: 'tools',
      isAppShortcut: true,
    };

    onAddShortcut(shortcut);
    setNewTitle('');
    setNewUrl('');
    setIsAddModalOpen(false);
  };

  return (
    <div id="quick-shortcuts-section" className="w-full max-w-2xl mx-auto mt-6 px-2">
      {/* Header bar with standalone app toggle info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>المواقع والتطبيقات السريعة</span>
          </h2>
          <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-2 py-0.5 rounded-full border border-slate-700">
            {shortcuts.length} موقع
          </span>
        </div>

        <button
          id="add-shortcut-top-btn"
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-xl transition border border-amber-500/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة موقع</span>
        </button>
      </div>

      {/* Grid of 10 Main Shortcuts + Add Button */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3.5">
        {shortcuts.map((shortcut) => {
          const isMenuOpen = activeMenuId === shortcut.id;

          return (
            <div
              key={shortcut.id}
              id={`shortcut-${shortcut.id}`}
              className="relative group flex flex-col items-center text-center"
            >
              {/* Shortcut Card Button */}
              <div
                onClick={() => onOpenShortcut(shortcut, false)}
                role="button"
                tabIndex={0}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/80 hover:border-amber-500/40 shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer group-hover:scale-105 active:scale-95 relative"
              >
                {renderIcon(shortcut.iconName)}
              </div>

              {/* Title label */}
              <span className="text-[11px] font-medium text-slate-300 mt-1.5 line-clamp-1 max-w-[70px] group-hover:text-amber-300 transition">
                {shortcut.titleAr}
              </span>

              {/* Context menu toggle button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(isMenuOpen ? null : shortcut.id);
                }}
                className="absolute -top-1 -left-1 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition z-10"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {/* Menu Popup */}
              {isMenuOpen && (
                <div className="absolute top-12 z-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 w-44 text-right backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenShortcut(shortcut, false);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 cursor-pointer"
                  >
                    <span>فتح في المتصفح</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenShortcut(shortcut, true);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-amber-300 font-bold hover:bg-amber-500/20 cursor-pointer"
                  >
                    <span>تطبيق بدون ترويسة</span>
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  {(
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveShortcut(shortcut.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer border-t border-slate-800 mt-1 pt-1"
                    >
                      <span>حذف الاختصار</span>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Shortcut Tile */}
        <div
          id="add-shortcut-grid-tile"
          onClick={() => setIsAddModalOpen(true)}
          role="button"
          tabIndex={0}
          className="flex flex-col items-center text-center cursor-pointer group"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-400/60 bg-slate-900/40 hover:bg-slate-800/40 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-amber-400 transition" />
          </div>
          <span className="text-[11px] font-medium text-slate-400 mt-1.5 group-hover:text-amber-300 transition">
            إضافة
          </span>
        </div>
      </div>

      {/* Add Shortcut Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>إضافة موقع جديد إلى الشاشة الرئيسية</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              يمكنك تشغيله كصفحة ويب أو كتطبيق مستقل بدون ترويسة المتصفح.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الموقع</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: Reddit أو لينكد إن"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رابط الموقع (URL)</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-sans"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  حفظ الاختصار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
