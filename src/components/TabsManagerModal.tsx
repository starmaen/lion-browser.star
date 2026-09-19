import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  Globe,
  Layers,
  ShieldCheck,
  Folder,
  FolderPlus,
  FolderOpen,
  Edit2,
  Trash2,
  Check,
  CheckSquare,
  Square,
  ChevronDown,
  Search,
  Tag,
  ArrowRightLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { BrowserTab, TabFolder } from '../types';

export interface TabsManagerModalProps {
  tabs: BrowserTab[];
  activeTabId: string;
  folders: TabFolder[];
  currentLanguage?: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: (folderId?: string) => void;
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => string;
  onUpdateFolder: (id: string, name: string, color: string) => void;
  onDeleteFolder: (id: string, deleteTabs: boolean) => void;
  onAssignTabFolder: (tabId: string, folderId?: string) => void;
  onAssignMultipleTabsFolder: (tabIds: string[], folderId?: string) => void;
  onCloseFolderTabs?: (folderId: string) => void;
  previousTabId?: string | null;
  onReturnToPreviousTab?: () => void;
}

const PRESET_COLORS = [
  { name: 'ذهبي / كهرماني', hex: '#f59e0b' },
  { name: 'زمردي / أخضر', hex: '#10b981' },
  { name: 'أزرق ملكي', hex: '#3b82f6' },
  { name: 'بنفسجي داكن', hex: '#8b5cf6' },
  { name: 'وردي / أحمر', hex: '#f43f5e' },
  { name: 'سماوي / تركواز', hex: '#06b6d4' },
  { name: 'برتقالي مشرق', hex: '#f97316' },
  { name: 'فوشيا / وردي', hex: '#ec4899' },
];

const SUGGESTED_FOLDER_NAMES = [
  { label: 'العمل والمهام', icon: '💼', color: '#3b82f6' },
  { label: 'البحث والقراءة', icon: '📚', color: '#10b981' },
  { label: 'الترفيه والفيديو', icon: '🎬', color: '#f59e0b' },
  { label: 'التسوق والطلبات', icon: '🛒', color: '#ec4899' },
  { label: 'البرمجة والتطوير', icon: '💻', color: '#8b5cf6' },
  { label: 'أفكار ومشاريع', icon: '💡', color: '#06b6d4' },
];

export const TabsManagerModal: React.FC<TabsManagerModalProps> = ({
  tabs,
  activeTabId,
  folders,
  currentLanguage = 'ar',
  onSelectTab,
  onCloseTab,
  onNewTab,
  onClose,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onAssignTabFolder,
  onAssignMultipleTabsFolder,
  onCloseFolderTabs,
  previousTabId,
  onReturnToPreviousTab,
}) => {
  const isAr = currentLanguage === 'ar';

  // State: Active selected folder filter ('all', 'unassigned', or folder.id)
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');

  // State: Tab search query
  const [searchQuery, setSearchQuery] = useState('');

  // State: Multi-select mode
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedTabIds, setSelectedTabIds] = useState<string[]>([]);

  // State: Create / Edit Folder Modal dialog
  const [isFolderEditorOpen, setIsFolderEditorOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderColorInput, setFolderColorInput] = useState('#f59e0b');

  // State: Delete Folder Confirmation Dialog
  const [folderToDelete, setFolderToDelete] = useState<TabFolder | null>(null);

  // State: Dropdown for assigning tab to folder: holds tabId whose menu is currently open
  const [tabFolderMenuOpenId, setTabFolderMenuOpenId] = useState<string | null>(null);

  // State: Multi-select folder assignment dropdown open
  const [isMultiAssignMenuOpen, setIsMultiAssignMenuOpen] = useState(false);

  // Close menus when clicking outside
  const menuContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setTabFolderMenuOpenId(null);
        setIsMultiAssignMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered tabs according to selected folder and search query
  const filteredTabs = useMemo(() => {
    return tabs.filter((tab) => {
      // 1. Folder filter
      if (selectedFolderFilter === 'all') {
        // all tabs
      } else if (selectedFolderFilter === 'unassigned') {
        if (tab.folderId) return false;
      } else {
        if (tab.folderId !== selectedFolderFilter) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = tab.title?.toLowerCase().includes(q);
        const matchesUrl = tab.url?.toLowerCase().includes(q);
        return matchesTitle || matchesUrl;
      }

      return true;
    });
  }, [tabs, selectedFolderFilter, searchQuery]);

  // Tab counts by folder
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: tabs.length,
      unassigned: 0,
    };
    folders.forEach((f) => {
      counts[f.id] = 0;
    });

    tabs.forEach((t) => {
      if (!t.folderId) {
        counts.unassigned += 1;
      } else if (counts[t.folderId] !== undefined) {
        counts[t.folderId] += 1;
      } else {
        // assigned to a folder that might have been removed
        counts.unassigned += 1;
      }
    });

    return counts;
  }, [tabs, folders]);

  // Current active folder object if a custom folder is selected
  const activeSelectedFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderFilter) || null;
  }, [folders, selectedFolderFilter]);

  // Multi-select helpers
  const handleToggleSelectTab = (tabId: string) => {
    setSelectedTabIds((prev) =>
      prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredTabs.map((t) => t.id);
    const allSelected = visibleIds.every((id) => selectedTabIds.includes(id));
    if (allSelected) {
      setSelectedTabIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedTabIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleCloseSelectedTabs = () => {
    if (selectedTabIds.length === 0) return;
    selectedTabIds.forEach((id) => {
      onCloseTab(id);
    });
    setSelectedTabIds([]);
  };

  const handleBatchAssignFolder = (folderId?: string) => {
    if (selectedTabIds.length === 0) return;
    onAssignMultipleTabsFolder(selectedTabIds, folderId);
    setSelectedTabIds([]);
    setIsMultiAssignMenuOpen(false);
  };

  // Open Create Folder
  const handleOpenCreateFolder = () => {
    setEditingFolderId(null);
    setFolderNameInput('');
    setFolderColorInput(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].hex);
    setIsFolderEditorOpen(true);
  };

  // Open Edit Folder
  const handleOpenEditFolder = (folder: TabFolder) => {
    setEditingFolderId(folder.id);
    setFolderNameInput(folder.name);
    setFolderColorInput(folder.color || '#f59e0b');
    setIsFolderEditorOpen(true);
  };

  // Save Folder (Create or Update)
  const handleSaveFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = folderNameInput.trim();
    if (!cleanName) return;

    if (editingFolderId) {
      onUpdateFolder(editingFolderId, cleanName, folderColorInput);
    } else {
      const newId = onCreateFolder(cleanName, folderColorInput);
      // Automatically switch to the newly created folder
      setSelectedFolderFilter(newId);
    }
    setIsFolderEditorOpen(false);
  };

  // Handle New Tab
  const handleCreateNewTab = () => {
    // If a specific folder is currently selected, create the tab in that folder!
    const targetFolderId =
      selectedFolderFilter !== 'all' && selectedFolderFilter !== 'unassigned'
        ? selectedFolderFilter
        : undefined;
    onNewTab(targetFolderId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div
        id="tabs-manager-modal"
        ref={menuContainerRef}
        className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col h-[92vh] max-h-[860px]"
      >
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          {/* Title & Tabs / Groups Count */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white">
                  {isAr ? 'إدارة التبويبات والمجلدات' : 'Tabs & Folder Groups'}
                </h2>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {tabs.length} {isAr ? 'تبويب' : 'tabs'}
                </span>
                <span className="text-[11px] bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded-full border border-blue-500/30 hidden sm:inline-flex">
                  {folders.length} {isAr ? 'مجلد' : 'folders'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isAr
                  ? 'قم بتنظيم تبويبات التصفح في مجلدات مخصصة لزيادة الإنتاجية وترتيب الجلسات'
                  : 'Group open tabs into named folders for better browsing organization'}
              </p>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Multi-select toggle */}
            <button
              id="multi-select-tabs-btn"
              type="button"
              onClick={() => {
                setIsMultiSelectMode(!isMultiSelectMode);
                setSelectedTabIds([]);
              }}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isMultiSelectMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={isAr ? 'تحديد تبويبات متعددة لنقلها أو إغلاقها معاً' : 'Multi-select tabs'}
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {isMultiSelectMode ? (isAr ? 'إلغاء التحديد' : 'Done') : (isAr ? 'تحديد متعدد' : 'Select')}
              </span>
            </button>

            {/* Return to Previous Tab Button */}
            {previousTabId && onReturnToPreviousTab && (
              <button
                type="button"
                onClick={() => {
                  onReturnToPreviousTab();
                  onClose();
                }}
                className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition shadow cursor-pointer"
                title={isAr ? 'العودة فوراً إلى علامة التبويب السابقة' : 'Return to previous tab'}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isAr ? 'التبويب السابق' : 'Prev Tab'}</span>
              </button>
            )}

            {/* Create New Folder Button */}
            <button
              id="create-tab-folder-btn"
              type="button"
              onClick={handleOpenCreateFolder}
              className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow cursor-pointer border border-blue-400/30"
              title={isAr ? 'إنشاء مجلد جديد لتنظيم التبويبات' : 'Create new tab folder'}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{isAr ? 'مجلد جديد' : 'New Folder'}</span>
            </button>

            {/* New Tab Button */}
            <button
              id="new-tab-manager-btn"
              type="button"
              onClick={handleCreateNewTab}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition shadow cursor-pointer"
              title={
                activeSelectedFolder
                  ? isAr
                    ? `فتح تبويب جديد في مجلد "${activeSelectedFolder.name}"`
                    : `Open new tab in "${activeSelectedFolder.name}"`
                  : isAr
                  ? 'فتح تبويب جديد'
                  : 'New tab'
              }
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'تبويب جديد' : 'New Tab'}</span>
            </button>

            {/* Close Modal */}
            <button
              id="close-tabs-manager-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader: Search bar & Folders Filter Pills */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-2.5">
          {/* Quick Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-tabs-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث في أسماء أو عناوين URL للتبويبات المفتوحة...'
                    : 'Search open tabs by title or URL...'
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {searchQuery && (
              <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                {filteredTabs.length} {isAr ? 'نتيجة' : 'results'}
              </span>
            )}
          </div>

          {/* Folder Chips / Navigation Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs select-none">
            {/* All Tabs Pill */}
            <button
              id="folder-filter-all"
              type="button"
              onClick={() => setSelectedFolderFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedFolderFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isAr ? 'كل التبويبات' : 'All Tabs'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  selectedFolderFilter === 'all' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {folderCounts.all || 0}
              </span>
            </button>

            {/* Unassigned Tabs Pill */}
            <button
              id="folder-filter-unassigned"
              type="button"
              onClick={() => setSelectedFolderFilter('unassigned')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedFolderFilter === 'unassigned'
                  ? 'bg-slate-700 text-white border-slate-600 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <Tag className="w-3.5 h-3.5 opacity-60" />
              <span>{isAr ? 'غير مصنفة' : 'Unassigned'}</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {folderCounts.unassigned || 0}
              </span>
            </button>

            {/* Custom Folders Pills */}
            {folders.map((folder) => {
              const count = folderCounts[folder.id] || 0;
              const isSelected = selectedFolderFilter === folder.id;
              return (
                <div
                  key={folder.id}
                  id={`folder-pill-${folder.id}`}
                  onClick={() => setSelectedFolderFilter(folder.id)}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-800 text-white border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                  style={{
                    borderLeftColor: isSelected ? undefined : folder.color,
                    borderLeftWidth: isSelected ? undefined : '3px',
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: folder.color || '#f59e0b' }}
                  />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">{folder.name}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold"
                    style={{
                      backgroundColor: `${folder.color || '#f59e0b'}25`,
                      color: folder.color || '#f59e0b',
                    }}
                  >
                    {count}
                  </span>

                  {/* Quick Edit Folder Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditFolder(folder);
                    }}
                    className="p-1 text-slate-500 hover:text-amber-400 rounded transition opacity-0 group-hover:opacity-100"
                    title={isAr ? 'تعديل اسم أو لون المجلد' : 'Edit folder'}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Add folder shortcut button */}
            <button
              id="folder-strip-add-btn"
              type="button"
              onClick={handleOpenCreateFolder}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-400 hover:text-amber-400 transition cursor-pointer whitespace-nowrap text-xs font-bold"
              title={isAr ? 'إضافة مجلد جديد' : 'Add folder'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'مجلد جديد' : 'New'}</span>
            </button>
          </div>
        </div>

        {/* Selected Folder Management Banner (Displayed when a specific folder is selected) */}
        {activeSelectedFolder && (
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeSelectedFolder.color }}
              />
              <span className="font-black text-white text-sm">
                {activeSelectedFolder.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ({folderCounts[activeSelectedFolder.id] || 0} {isAr ? 'تبويب' : 'tabs'})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Add tab directly in this folder */}
              <button
                type="button"
                onClick={() => onNewTab(activeSelectedFolder.id)}
                className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px]"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? 'إضافة تبويب هنا' : 'New Tab Here'}</span>
              </button>

              {/* Edit folder button */}
              <button
                type="button"
                onClick={() => handleOpenEditFolder(activeSelectedFolder)}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px]"
              >
                <Edit2 className="w-3 h-3 text-amber-400" />
                <span>{isAr ? 'تعديل' : 'Edit'}</span>
              </button>

              {/* Close all tabs in folder */}
              {(folderCounts[activeSelectedFolder.id] || 0) > 0 && onCloseFolderTabs && (
                <button
                  type="button"
                  onClick={() => onCloseFolderTabs(activeSelectedFolder.id)}
                  className="flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px]"
                  title={isAr ? 'إغلاق جميع التبويبات المفتوحة في هذا المجلد' : 'Close all tabs in this folder'}
                >
                  <X className="w-3 h-3" />
                  <span>{isAr ? 'إغلاق التبويبات' : 'Close tabs'}</span>
                </button>
              )}

              {/* Delete folder button */}
              <button
                type="button"
                onClick={() => setFolderToDelete(activeSelectedFolder)}
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title={isAr ? 'حذف هذا المجلد' : 'Delete folder'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Multi-Select Floating Action Bar (when tabs are selected) */}
        {isMultiSelectMode && (
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>
                {isAr
                  ? `تم تحديد ${selectedTabIds.length} من أصل ${filteredTabs.length} تبويب`
                  : `Selected ${selectedTabIds.length} of ${filteredTabs.length} tabs`}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Select All Visible */}
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition"
              >
                {selectedTabIds.length === filteredTabs.length
                  ? isAr
                    ? 'إلغاء تحديد الكل'
                    : 'Deselect All'
                  : isAr
                  ? 'تحديد الكل'
                  : 'Select All'}
              </button>

              {/* Move selected to folder dropdown */}
              <div className="relative">
                <button
                  id="multi-assign-folder-btn"
                  type="button"
                  disabled={selectedTabIds.length === 0}
                  onClick={() => setIsMultiAssignMenuOpen(!isMultiAssignMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition shadow cursor-pointer ${
                    selectedTabIds.length === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Folder className="w-3 h-3" />
                  <span>{isAr ? 'نقل إلى مجلد...' : 'Move to folder...'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Dropdown Menu for Multi Assign */}
                {isMultiAssignMenuOpen && (
                  <div className="absolute left-0 sm:right-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800">
                      {isAr ? 'اختر المجلد المطلوب:' : 'Choose target folder:'}
                    </div>

                    <div className="max-h-48 overflow-y-auto py-1">
                      {/* Unassign option */}
                      <button
                        type="button"
                        onClick={() => handleBatchAssignFolder(undefined)}
                        className="w-full text-right rtl:text-right ltr:text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 flex items-center gap-2 text-xs transition"
                      >
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isAr ? 'غير مصنفة (إزالة من المجلد)' : 'Remove from folder'}</span>
                      </button>

                      {/* Folder list */}
                      {folders.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleBatchAssignFolder(f.id)}
                          className="w-full text-right rtl:text-right ltr:text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-2 text-xs transition"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: f.color }}
                          />
                          <span className="truncate">{f.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Create new folder directly */}
                    <div className="border-t border-slate-800 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMultiAssignMenuOpen(false);
                          handleOpenCreateFolder();
                        }}
                        className="w-full text-right rtl:text-right ltr:text-left px-3 py-1.5 hover:bg-slate-800 text-amber-400 flex items-center gap-2 text-xs font-bold transition"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>{isAr ? '+ إنشاء مجلد جديد...' : '+ New Folder...'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Selected Tabs */}
              <button
                type="button"
                disabled={selectedTabIds.length === 0}
                onClick={handleCloseSelectedTabs}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-[11px] transition shadow cursor-pointer ${
                  selectedTabIds.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                <X className="w-3 h-3" />
                <span>{isAr ? 'إغلاق المحددة' : 'Close Selected'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tabs Grid Area */}
        <div className="p-4 flex-1 overflow-y-auto">
          {filteredTabs.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-3xl border border-dashed border-slate-800">
              <div className="w-14 h-14 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
                {selectedFolderFilter !== 'all' && selectedFolderFilter !== 'unassigned' ? (
                  <FolderOpen className="w-7 h-7 text-amber-400" />
                ) : (
                  <Globe className="w-7 h-7 text-slate-500" />
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">
                {searchQuery
                  ? isAr
                    ? 'لم يتم العثور على تبويبات تطابق البحث'
                    : 'No tabs match your search'
                  : activeSelectedFolder
                  ? isAr
                    ? `لا توجد تبويبات في مجلد "${activeSelectedFolder.name}" حالياً`
                    : `No tabs in folder "${activeSelectedFolder.name}"`
                  : isAr
                  ? 'لا توجد تبويبات في هذا القسم'
                  : 'No tabs in this section'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                {activeSelectedFolder
                  ? isAr
                    ? 'يمكنك فتح تبويب جديد مباشرة داخل هذا المجلد أو نقل تبويبات مفتوحة إليه من قائمة كل التبويبات.'
                    : 'Open a new tab inside this folder or move existing tabs into it.'
                  : isAr
                  ? 'انقر على الزر أدناه لفتح تبويب جديد والبدء في التصفح.'
                  : 'Click below to open a new tab and start browsing.'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateNewTab}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {activeSelectedFolder
                      ? isAr
                        ? 'فتح تبويب في هذا المجلد'
                        : 'Open Tab in this Folder'
                      : isAr
                      ? 'فتح تبويب جديد'
                      : 'Open New Tab'}
                  </span>
                </button>
                {selectedFolderFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedFolderFilter('all')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                  >
                    {isAr ? 'عرض كل التبويبات' : 'View All Tabs'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const isSelected = selectedTabIds.includes(tab.id);
                const assignedFolder = folders.find((f) => f.id === tab.folderId);
                const isFolderMenuOpen = tabFolderMenuOpenId === tab.id;

                return (
                  <div
                    key={tab.id}
                    id={`tab-card-${tab.id}`}
                    onClick={() => {
                      if (isMultiSelectMode) {
                        handleToggleSelectTab(tab.id);
                      } else {
                        onSelectTab(tab.id);
                      }
                    }}
                    className={`relative rounded-2xl border p-3.5 cursor-pointer transition-all flex flex-col justify-between h-44 select-none group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/15 ring-2 ring-amber-400/50'
                        : isActive
                        ? 'bg-slate-800/95 border-amber-400 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/30'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Top Row: Title, Multi-select checkbox, Folder badge, Close button */}
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        {/* Checkbox or Globe icon */}
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          {isMultiSelectMode ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSelectTab(tab.id);
                              }}
                              className={`p-0.5 rounded cursor-pointer ${
                                isSelected ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 fill-amber-400/20" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </div>
                          ) : (
                            <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                          )}

                          <span className="text-xs font-bold text-slate-200 truncate" title={tab.title}>
                            {tab.title || (isAr ? 'صفحة ويب' : 'Web Page')}
                          </span>
                        </div>

                        {/* Close Tab Button */}
                        {tabs.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCloseTab(tab.id);
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition shrink-0"
                            title={isAr ? 'إغلاق هذا التبويب' : 'Close tab'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Tab URL Preview Box */}
                      <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 font-mono truncate">
                        {tab.url}
                      </div>
                    </div>

                    {/* Bottom Row: Folder Assignment Pill & Protection Status */}
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1 text-[11px]">
                      {/* Folder Pill with Quick Assignment Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTabFolderMenuOpenId(isFolderMenuOpen ? null : tab.id);
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold transition hover:scale-105"
                          style={{
                            backgroundColor: assignedFolder
                              ? `${assignedFolder.color}20`
                              : '#1e293b',
                            borderColor: assignedFolder
                              ? `${assignedFolder.color}50`
                              : '#334155',
                            color: assignedFolder ? assignedFolder.color : '#94a3b8',
                          }}
                          title={isAr ? 'تغيير أو نقل مجلد التبويب' : 'Change or move folder'}
                        >
                          <Folder className="w-3 h-3" />
                          <span className="truncate max-w-[85px]">
                            {assignedFolder ? assignedFolder.name : isAr ? 'نقل لمجلد...' : 'Assign...'}
                          </span>
                          <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                        </button>

                        {/* Dropdown Menu for single tab folder assignment */}
                        {isFolderMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-full mb-1 right-0 sm:right-auto sm:left-0 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95"
                          >
                            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800">
                              {isAr ? 'تنظيم التبويب في مجلد:' : 'Organize tab in folder:'}
                            </div>

                            <div className="max-h-44 overflow-y-auto py-1">
                              {/* Unassign option */}
                              <button
                                type="button"
                                onClick={() => {
                                  onAssignTabFolder(tab.id, undefined);
                                  setTabFolderMenuOpenId(null);
                                }}
                                className={`w-full text-right rtl:text-right ltr:text-left px-3 py-1.5 hover:bg-slate-800 text-xs flex items-center justify-between transition ${
                                  !tab.folderId ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-400'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Tag className="w-3 h-3" />
                                  <span>{isAr ? 'غير مصنف (عام)' : 'Unassigned'}</span>
                                </div>
                                {!tab.folderId && <Check className="w-3 h-3" />}
                              </button>

                              {/* Folders list */}
                              {folders.map((f) => {
                                const isCurrent = tab.folderId === f.id;
                                return (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => {
                                      onAssignTabFolder(tab.id, f.id);
                                      setTabFolderMenuOpenId(null);
                                    }}
                                    className={`w-full text-right rtl:text-right ltr:text-left px-3 py-1.5 hover:bg-slate-800 text-xs flex items-center justify-between transition ${
                                      isCurrent ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: f.color }}
                                      />
                                      <span className="truncate">{f.name}</span>
                                    </div>
                                    {isCurrent && <Check className="w-3 h-3" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Create new folder button */}
                            <div className="border-t border-slate-800 pt-1 mt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setTabFolderMenuOpenId(null);
                                  handleOpenCreateFolder();
                                }}
                                className="w-full text-right rtl:text-right ltr:text-left px-3 py-1.5 hover:bg-slate-800 text-amber-400 flex items-center gap-1.5 text-xs font-bold transition"
                              >
                                <FolderPlus className="w-3 h-3" />
                                <span>{isAr ? '+ إنشاء مجلد جديد...' : '+ New folder...'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Active or Protected Badge */}
                      <div className="flex items-center gap-1">
                        {isActive ? (
                          <span className="text-amber-300 font-bold bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 text-[10px]">
                            {isAr ? 'نشط حالياً' : 'Active'}
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{isAr ? 'محمي' : 'Safe'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {isAr
                ? 'ميزة تنظيم التبويبات في مجلدات تحفظ استهلاك الذاكرة وتسهل العودة للجلسات السابقة'
                : 'Tab grouping in named folders optimizes memory & session management'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="new-tab-footer-btn"
              type="button"
              onClick={handleCreateNewTab}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'تبويب جديد' : 'New Tab'}</span>
            </button>
            <button
              id="close-tabs-manager-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {/* 1. Modal: Create or Edit Tab Folder Dialog */}
      {isFolderEditorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md"
                  style={{ backgroundColor: folderColorInput }}
                >
                  <Folder className="w-4 h-4 text-slate-950 fill-slate-950" />
                </div>
                <h3 className="text-base font-black text-white">
                  {editingFolderId
                    ? isAr
                      ? 'تعديل مجلد التبويبات'
                      : 'Edit Tab Folder'
                    : isAr
                    ? 'إنشاء مجلد تبويبات جديد'
                    : 'Create New Tab Folder'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFolderEditorOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="space-y-4">
              {/* Folder Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isAr ? 'اسم المجلد:' : 'Folder Name:'}
                </label>
                <input
                  id="folder-name-input"
                  type="text"
                  autoFocus
                  required
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  placeholder={isAr ? 'مثال: أبحاث العمل، التسوق، البرمجة...' : 'e.g. Work, Study, Shopping...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition font-bold"
                />
              </div>

              {/* Quick suggestions */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  {isAr ? 'أفكار وتسميات سريعة مقترحة:' : 'Suggested quick tags:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_FOLDER_NAMES.map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => {
                        setFolderNameInput(sug.label);
                        setFolderColorInput(sug.color);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                    >
                      <span>{sug.icon}</span>
                      <span>{sug.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isAr ? 'لون المجلد التمييزي:' : 'Folder Color Badge:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((col) => {
                    const isSelected = folderColorInput.toLowerCase() === col.hex.toLowerCase();
                    return (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setFolderColorInput(col.hex)}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-white shadow-md ring-2 ring-white/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="text-[11px] text-slate-300 truncate font-medium">
                          {col.name.split('/')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFolderEditorOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  id="save-folder-btn"
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {editingFolderId
                      ? isAr
                        ? 'حفظ التعديلات'
                        : 'Save Changes'
                      : isAr
                      ? 'إنشاء المجلد'
                      : 'Create Folder'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Delete Folder Confirmation Dialog */}
      {folderToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3 className="text-base font-black text-white mb-1">
              {isAr
                ? `حذف المجلد "${folderToDelete.name}"؟`
                : `Delete folder "${folderToDelete.name}"?`}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isAr
                ? 'هل ترغب في فك تجميع التبويبات ونقلها إلى القسم العام (غير مصنفة)، أم إغلاق جميع تبويبات هذا المجلد؟'
                : 'Would you like to keep the tabs open as unassigned, or close all tabs inside this folder?'}
            </p>

            <div className="flex flex-col gap-2">
              {/* Option 1: Keep Tabs, remove folder */}
              <button
                type="button"
                onClick={() => {
                  onDeleteFolder(folderToDelete.id, false);
                  if (selectedFolderFilter === folderToDelete.id) {
                    setSelectedFolderFilter('all');
                  }
                  setFolderToDelete(null);
                }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition text-right rtl:text-right ltr:text-left flex items-center justify-between"
              >
                <span>{isAr ? 'فك التجميع فقط مع إبقاء التبويبات مفتوحة' : 'Keep tabs open (Unassign)'}</span>
                <Tag className="w-4 h-4 text-slate-400" />
              </button>

              {/* Option 2: Close all tabs and remove folder */}
              <button
                type="button"
                onClick={() => {
                  onDeleteFolder(folderToDelete.id, true);
                  if (selectedFolderFilter === folderToDelete.id) {
                    setSelectedFolderFilter('all');
                  }
                  setFolderToDelete(null);
                }}
                className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl transition text-right rtl:text-right ltr:text-left flex items-center justify-between"
              >
                <span>{isAr ? 'إغلاق جميع تبويبات هذا المجلد وحذفه نهائياً' : 'Close all tabs & delete folder'}</span>
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => setFolderToDelete(null)}
                className="w-full py-2 px-4 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition mt-1"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
