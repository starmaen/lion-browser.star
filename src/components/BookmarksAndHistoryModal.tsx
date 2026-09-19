import React, { useState } from 'react';
import {
  Bookmark,
  Clock,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  FolderPlus,
  History,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Globe,
  Share2,
  Calendar,
  Filter,
  Check
} from 'lucide-react';
import { BookmarkItem, HistoryItem } from '../types';

interface BookmarksAndHistoryModalProps {
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  initialTab?: 'bookmarks' | 'history';
  onNavigate: (url: string, title?: string) => void;
  onAddBookmark: (bookmark: BookmarkItem) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: (timeRange?: 'hour' | 'today' | 'week' | 'all') => void;
  onOpenClearDataModal: () => void;
  onClose: () => void;
}

export const BookmarksAndHistoryModal: React.FC<BookmarksAndHistoryModalProps> = ({
  bookmarks,
  history,
  initialTab = 'bookmarks',
  onNavigate,
  onAddBookmark,
  onDeleteBookmark,
  onDeleteHistoryItem,
  onClearHistory,
  onOpenClearDataModal,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'hour' | 'today' | 'week'>('all');
  const [isClearDropdownOpen, setIsClearDropdownOpen] = useState(false);
  const [clearedToast, setClearedToast] = useState<string | null>(null);

  // Filtered lists
  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter((h) => {
    const matchesText =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.url.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesText) return false;

    if (historyFilter === 'all') return true;
    const now = Date.now();
    const itemTime = h.timeMs || (h.date ? new Date(h.date).getTime() : now);
    if (historyFilter === 'hour') {
      return itemTime >= now - 60 * 60 * 1000;
    }
    if (historyFilter === 'today') {
      return itemTime >= now - 24 * 60 * 60 * 1000;
    }
    if (historyFilter === 'week') {
      return itemTime >= now - 7 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  const handleCreateBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    onAddBookmark({
      id: 'bm-' + Date.now(),
      title: newTitle.trim(),
      url: finalUrl,
      createdAt: 'الآن',
    });

    setNewTitle('');
    setNewUrl('');
    setShowAddBookmark(false);
  };

  const handleExecuteClear = (range: 'hour' | 'today' | 'week' | 'all') => {
    setIsClearDropdownOpen(false);
    onClearHistory(range);
    const labelMap: Record<string, string> = {
      hour: 'آخر ساعة',
      today: 'آخر 24 ساعة (اليوم)',
      week: 'آخر 7 أيام',
      all: 'كامل سجل التصفح',
    };
    setClearedToast(`تم مسح ${labelMap[range]} بنجاح!`);
    setTimeout(() => setClearedToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        id="bookmarks-history-modal"
        className="bg-slate-900 border border-slate-800 w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header Tabs */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>المفضلة والإشارات المرجعية ({bookmarks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>سجل التصفح والمسارات ({history.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Sub-Actions */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder={
                  activeTab === 'bookmarks'
                    ? 'بحث في المواقع المفضلة...'
                    : 'بحث داخل سجل التصفح بالاسم أو الرابط...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-8 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                  title="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeTab === 'bookmarks' ? (
              <button
                type="button"
                onClick={() => setShowAddBookmark(!showAddBookmark)}
                className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة رابط</span>
              </button>
            ) : (
              <div className="relative flex items-center gap-1.5">
                {/* Clear by range dropdown trigger */}
                <button
                  type="button"
                  onClick={() => setIsClearDropdownOpen(!isClearDropdownOpen)}
                  className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                  title="مسح سجل التصفح بنطاق زمني محدد"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح بنطاق زمني</span>
                </button>

                {/* Dropdown Menu for Time-Range Clearing */}
                {isClearDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-right backdrop-blur-xl animate-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
                      <span>مسح السجل لنطاق:</span>
                      <X
                        className="w-3 h-3 cursor-pointer text-slate-500 hover:text-white"
                        onClick={() => setIsClearDropdownOpen(false)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExecuteClear('hour')}
                      className="w-full text-right px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition flex items-center justify-between cursor-pointer"
                    >
                      <span>آخر ساعة (Last Hour)</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteClear('today')}
                      className="w-full text-right px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition flex items-center justify-between cursor-pointer"
                    >
                      <span>آخر 24 ساعة (اليوم)</span>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteClear('week')}
                      className="w-full text-right px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition flex items-center justify-between cursor-pointer"
                    >
                      <span>آخر 7 أيام (الأسبوع)</span>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <div className="border-t border-slate-800 my-1"></div>
                    <button
                      type="button"
                      onClick={() => handleExecuteClear('all')}
                      className="w-full text-right px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-600 hover:text-white transition flex items-center justify-between cursor-pointer"
                    >
                      <span>مسح كل السجل</span>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time Filter Chips for History */}
          {activeTab === 'history' && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">عرض:</span>
                {(
                  [
                    { id: 'all', label: 'الكل' },
                    { id: 'hour', label: 'آخر ساعة' },
                    { id: 'today', label: 'اليوم (24 س)' },
                    { id: 'week', label: 'آخر أسبوع' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      historyFilter === f.id
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {searchQuery && (
                <span className="text-[11px] text-amber-400 font-mono">
                  {filteredHistory.length} نتيجة
                </span>
              )}
            </div>
          )}
        </div>

        {/* Add Bookmark form */}
        {activeTab === 'bookmarks' && showAddBookmark && (
          <form
            onSubmit={handleCreateBookmark}
            className="p-4 bg-slate-950 border-b border-slate-800 space-y-2.5 animate-in slide-in-from-top-1 duration-150"
          >
            <div className="text-xs font-bold text-amber-300">إضافة إشارة مرجعية جديدة:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="عنوان الموقع (مثال: منتدى المطورين)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
              <input
                type="text"
                placeholder="الرابط (URL)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                dir="ltr"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddBookmark(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                حفظ في المفضلة
              </button>
            </div>
          </form>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'bookmarks' ? (
            /* Bookmarks List */
            filteredBookmarks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">لا توجد مواقع مفضلة مضافة</p>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك حفظ أي موقع تزوره بالنقر على علامة النجمة/المفضلة في شريط العنوان
                </p>
              </div>
            ) : (
              filteredBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3 bg-slate-950 rounded-2xl border border-slate-800 hover:border-amber-500/40 flex items-center justify-between gap-3 group transition"
                >
                  <div
                    onClick={() => {
                      onNavigate(bm.url, bm.title);
                      onClose();
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-100 truncate block hover:text-amber-300">
                        {bm.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate block" dir="ltr">
                        {bm.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(bm.url, bm.title);
                        onClose();
                      }}
                      className="p-2 text-amber-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="فتح الرابط"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                      title="حذف من المفضلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            /* History & Backward paths List */
            filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">سجل التصفح فارغ</p>
                <p className="text-xs text-slate-500 mt-1">
                  المواقع والمسارات التي تزورها ستظهر هنا مع إمكانية العودة إليها في أي وقت
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950 rounded-2xl border border-slate-800 hover:border-blue-500/40 flex items-center justify-between gap-3 group transition"
                >
                  <div
                    onClick={() => {
                      onNavigate(item.url, item.title);
                      onClose();
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-200 truncate block hover:text-blue-400">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-mono text-slate-500 truncate max-w-[200px]" dir="ltr">
                          {item.url}
                        </span>
                        <span>•</span>
                        <span className="shrink-0">{item.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(item.url, item.title);
                        onClose();
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="الرجوع إلى هذا المسار والموقع"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                      title="حذف من السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>
              {activeTab === 'bookmarks'
                ? 'يتم مزامنة المفضلات مع حساب غوغل المشترك'
                : 'مسارات رجعية فورية لكافة الصفحات التي تم فتحها'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
