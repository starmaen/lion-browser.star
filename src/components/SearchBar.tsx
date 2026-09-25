import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Mic, QrCode, X, ChevronDown, Sparkles, ArrowUpLeft, Clock } from 'lucide-react';
import { SearchEngineId, HistoryItem } from '../types';
import { SEARCH_ENGINES } from '../data/initialData';

interface SearchBarProps {
  currentEngine: SearchEngineId;
  onEngineChange: (engine: SearchEngineId) => void;
  onSearch: (query: string, engine: SearchEngineId) => void;
  initialQuery?: string;
  history?: HistoryItem[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  currentEngine,
  onEngineChange,
  onSearch,
  initialQuery = '',
  history = [],
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // إغلاق وضع البحث الكامل بمفتاح الرجوع بدل الخروج من التطبيق
  useEffect(() => {
    if (!isFocused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isFocused]);

  const runSearch = (text: string) => {
    if (!text.trim()) return;
    onSearch(text.trim(), currentEngine);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleVoiceSimulate = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      setQuery('Android Studio latest tips and tricks');
      setIsVoiceListening(false);
      if (inputRef.current) inputRef.current.focus();
    }, 1800);
  };

  const currentEngineObj = SEARCH_ENGINES[currentEngine];

  const popularSuggestions = [
    { text: 'أحدث رومات وأدوات مطوري الأندرويد XDA', isDev: true },
    { text: 'تحميل Android Studio Ladybug', isDev: true },
    { text: 'مشاريع GitHub مفتوحة المصدر بالذكاء الاصطناعي', isDev: true },
    { text: 'كيفية تسريع هواتف أندرويد وتوفير الرام والبطارية', isDev: false },
  ];

  // اقتراحات من السجل تُطابق ما يكتبه المستخدم (بديل محلي لاقتراحات غوغل الحية)
  const q = query.trim().toLowerCase();
  const historySuggestions = q
    ? history
        .filter((h) => h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q))
        .slice(0, 6)
    : [];

  const fullScreen = isFocused;

  return (
    <div id="search-section" className="w-full max-w-3xl mx-auto px-2">
      {/* خلفية معتمة تغطي الصفحة كاملة أثناء البحث الكامل */}
      {fullScreen && (
        <div
          className="fixed inset-0 bg-slate-950/98 z-[70] flex flex-col"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex-1 overflow-y-auto px-3 pt-16">
            {q === '' ? (
              <>
                {history.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[11px] font-bold text-slate-400 px-1 mb-1.5">آخر ما زرته:</div>
                    {history.slice(0, 6).map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => runSearch(h.url)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl text-sm text-right text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition"
                      >
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate flex-1">{h.title || h.url}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-[11px] font-bold text-slate-400 px-1 mb-1.5 flex items-center justify-between">
                  <span>اقتراحات بحث شائعة وسريعة:</span>
                  <span className="text-[10px] text-amber-400/80">Lion Turbo Cache</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {popularSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => runSearch(item.text)}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-sm text-right text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition"
                    >
                      <Search className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{item.text}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => runSearch(query)}
                  className="w-full flex items-center gap-2.5 p-3 rounded-xl text-sm text-right text-slate-100 hover:bg-slate-800 transition"
                >
                  <Search className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate flex-1">
                    البحث عن «{query}» في {currentEngineObj.nameAr}
                  </span>
                </button>
                {historySuggestions.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => runSearch(h.url)}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl text-sm text-right text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition"
                  >
                    <ArrowUpLeft className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate flex-1">{h.title || h.url}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Search Input Box */}
      <form onSubmit={handleSubmit} className={`relative ${fullScreen ? 'fixed inset-x-2 z-[71]' : ''}`} style={fullScreen ? { top: 'max(env(safe-area-inset-top, 0px), 12px)' } : undefined}>
        <div
          className={`relative flex items-center bg-slate-900/95 backdrop-blur-xl border rounded-2xl shadow-xl transition-all duration-300 ${
            isFocused
              ? 'border-amber-400/80 ring-2 ring-amber-500/30 shadow-amber-500/10'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          {fullScreen ? (
            <button
              type="button"
              id="close-fullscreen-search-btn"
              onClick={() => {
                setIsFocused(false);
                inputRef.current?.blur();
              }}
              className="p-3 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="relative pr-2 pl-1">
              <button
                id="search-engine-dropdown-trigger"
                type="button"
                onClick={() => setIsEngineMenuOpen(true)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                title="تغيير محرك البحث"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentEngineObj.iconColor }} />
                <span className="hidden sm:inline">{currentEngineObj.nameAr}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              id="main-browser-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={currentEngineObj.placeholder}
              className="w-full bg-transparent py-4 px-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none font-medium"
              dir="auto"
            />

            {query && (
              <button
                id="clear-search-query-btn"
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Voice Search & Submit Action */}
          <div className="flex items-center gap-1 pl-2 pr-1">
            <button
              id="voice-search-btn"
              type="button"
              onClick={handleVoiceSimulate}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                isVoiceListening
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
              }`}
              title="البحث الصوتي"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              id="submit-search-btn"
              type="submit"
              className="flex items-center justify-center p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition"
              title="بحث"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {isVoiceListening && !fullScreen && (
        <div className="mt-2 text-center text-xs text-amber-400 font-medium animate-pulse flex items-center justify-center gap-1.5 bg-slate-900/80 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>جاري الاستماع لصوتك عبر متصفح الأسد...</span>
        </div>
      )}

      {/* نافذة اختيار محرك البحث: تغطي الشاشة كاملة بدل قائمة صغيرة فوق المحتوى */}
      {isEngineMenuOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end bg-black/60"
          onClick={() => setIsEngineMenuOpen(false)}
        >
          <div
            className="w-full max-w-2xl mx-auto bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 pb-6 text-slate-100 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-amber-400">اختر محرك البحث الافتراضي</h3>
              <button
                type="button"
                onClick={() => setIsEngineMenuOpen(false)}
                className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300"
              >
                إغلاق
              </button>
            </div>
            <div className="space-y-1">
              {(Object.keys(SEARCH_ENGINES) as SearchEngineId[]).map((engineKey) => {
                const engine = SEARCH_ENGINES[engineKey];
                const isSelected = currentEngine === engineKey;
                return (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => {
                      onEngineChange(engineKey);
                      setIsEngineMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: engine.iconColor }} />
                      <span>{engine.nameAr}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-sans">{engine.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 mt-3">يمكنك أيضاً تغيير محرك البحث الافتراضي من الإعدادات.</p>
          </div>
        </div>
      )}
    </div>
  );
};
