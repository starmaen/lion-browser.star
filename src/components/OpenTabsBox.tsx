import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  ArrowRightLeft,
  Globe,
  Search,
  Layers,
  FolderOpen,
  Home,
  CheckCircle,
  Clock,
  Sparkles,
  Compass,
} from 'lucide-react';
import { BrowserTab, TabFolder } from '../types';

export interface OpenTabsBoxProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: BrowserTab[];
  activeTabId: string;
  previousTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onCloseOtherTabs?: (keepId: string) => void;
  onReturnToPreviousTab?: () => void;
  onOpenAdvancedTabsManager?: () => void;
  folders?: TabFolder[];
  currentLanguage?: string;
}

export const OpenTabsBox: React.FC<OpenTabsBoxProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  previousTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onCloseOtherTabs,
  onReturnToPreviousTab,
  onOpenAdvancedTabsManager,
  folders = [],
  currentLanguage = 'ar',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isAr = currentLanguage === 'ar';

  if (!isOpen) return null;

  const previousTab = tabs.find((t) => t.id === previousTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Filter tabs by search query
  const filteredTabs = tabs.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.url && t.url.toLowerCase().includes(q))
    );
  });

  const getFolder = (folderId?: string) => {
    if (!folderId) return undefined;
    return folders.find((f) => f.id === folderId);
  };

  const getDomain = (url: string) => {
    if (url === 'about:home' || !url) return isAr ? 'الصفحة الرئيسية' : 'Home';
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div
      id="open-tabs-box-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="open-tabs-box-container"
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white">
                  {isAr ? 'صندوق علامات التبويب المفتوحة' : 'Open Tabs Box'}
                </h2>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {tabs.length} {isAr ? 'تبويب' : 'tabs'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'انقر على أي علامة تبويب للانتقال إليها أو عُد إلى التبويب السابق فوراً'
                  : 'Click any tab to switch or return directly to your previous tab'}
              </p>
            </div>
          </div>

          <button
            id="close-open-tabs-box-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Return to Previous Tab Banner */}
        {previousTab && previousTab.id !== activeTabId && (
          <div className="p-3 bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border-b border-amber-500/30 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <ArrowRightLeft className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <span>{isAr ? 'التبويب السابق الذي كنت فيه:' : 'Previous Tab:'}</span>
                </div>
                <div className="text-xs font-semibold text-white truncate max-w-[280px] sm:max-w-md">
                  {previousTab.title || previousTab.url}
                </div>
              </div>
            </div>

            <button
              id="return-to-previous-tab-box-btn"
              type="button"
              onClick={() => {
                if (onReturnToPreviousTab) {
                  onReturnToPreviousTab();
                } else {
                  onSelectTab(previousTab.id);
                }
                onClose();
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة إلى هذا التبويب' : 'Switch Back Now'}</span>
            </button>
          </div>
        )}

        {/* Quick Search inside Tabs */}
        {tabs.length > 3 && (
          <div className="p-3 bg-slate-950/50 border-b border-slate-800">
            <div className="relative flex items-center">
              <Search className={`w-4 h-4 text-slate-500 absolute ${isAr ? 'right-3' : 'left-3'}`} />
              <input
                id="search-tabs-box-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في علامات التبويب المفتوحة...' : 'Search in open tabs...'}
                className={`w-full bg-slate-900 border border-slate-700/70 focus:border-amber-400 rounded-xl py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
                  isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`text-slate-400 hover:text-white text-xs p-1 absolute ${
                    isAr ? 'left-2.5' : 'right-2.5'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabs Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredTabs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
              <Layers className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-medium">
                {isAr ? 'لا توجد علامات تبويب تطابق البحث' : 'No tabs match search query'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredTabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const isPrev = tab.id === previousTabId;
                const folder = getFolder(tab.folderId);
                const domain = getDomain(tab.url);

                return (
                  <div
                    key={tab.id}
                    id={`open-tab-card-${tab.id}`}
                    className={`group relative rounded-2xl border p-3 flex flex-col justify-between transition cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : isPrev
                        ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500/40 hover:bg-slate-800'
                        : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                    onClick={() => {
                      onSelectTab(tab.id);
                      onClose();
                    }}
                  >
                    {/* Top row: Badges & Close Button */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isActive && (
                          <span className="flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-ping"></span>
                            {isAr ? 'نشط الآن' : 'Active'}
                          </span>
                        )}
                        {isPrev && !isActive && (
                          <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] px-2 py-0.5 rounded-md">
                            <ArrowRightLeft className="w-2.5 h-2.5" />
                            {isAr ? 'التبويب السابق' : 'Previous'}
                          </span>
                        )}
                        {folder && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border"
                            style={{
                              backgroundColor: `${folder.color}20`,
                              borderColor: `${folder.color}50`,
                              color: folder.color,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: folder.color }}
                            ></span>
                            {folder.name}
                          </span>
                        )}
                      </div>

                      {/* Close Tab Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseTab(tab.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer shrink-0"
                        title={isAr ? 'إغلاق هذا التبويب' : 'Close this tab'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle: Title & URL */}
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                        {tab.url === 'about:home' ? (
                          <Home className="w-4 h-4 text-amber-400" />
                        ) : tab.url.includes('youtube') ? (
                          <span className="text-rose-500 font-black text-xs">YT</span>
                        ) : (
                          <Globe className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {tab.title || (tab.url === 'about:home' ? (isAr ? 'الصفحة الرئيسية' : 'Home') : tab.url)}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                          {domain}
                        </p>
                      </div>
                    </div>

                    {/* Footer row: Click hint */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      <span>{tab.url === 'about:home' ? (isAr ? 'صفحة البدء' : 'Start Page') : tab.url.slice(0, 35)}</span>
                      <span className="text-amber-400/80 group-hover:text-amber-300 font-bold">
                        {isActive ? (isAr ? 'معروض حالياً' : 'Current') : (isAr ? 'انقر للفتح' : 'Click to open')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {/* New Tab Button */}
            <button
              id="box-new-tab-btn"
              type="button"
              onClick={() => {
                onNewTab();
                onClose();
              }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'تبويب جديد' : 'New Tab'}</span>
            </button>

            {/* Close Other Tabs */}
            {tabs.length > 1 && onCloseOtherTabs && (
              <button
                type="button"
                onClick={() => {
                  onCloseOtherTabs(activeTabId);
                  onClose();
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs px-2.5 py-2 rounded-xl transition cursor-pointer border border-slate-800"
                title={isAr ? 'إغلاق جميع التبويبات باستثناء التبويب الحالي' : 'Close other tabs'}
              >
                <span>{isAr ? 'إغلاق الباقي' : 'Close Others'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Advanced Folders Organizer Button */}
            {onOpenAdvancedTabsManager && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdvancedTabsManager();
                }}
                className="flex items-center gap-1.5 text-blue-300 hover:text-white bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                title={isAr ? 'تنظيم التبويبات في مجلدات ومجموعات' : 'Organize into folders'}
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>{isAr ? 'المجلدات والمجموعات' : 'Folder Groups'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
