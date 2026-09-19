import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Mic, QrCode, X, ChevronDown, Sparkles } from 'lucide-react';
import { SearchEngineId } from '../types';
import { SEARCH_ENGINES } from '../data/initialData';

interface SearchBarProps {
  currentEngine: SearchEngineId;
  onEngineChange: (engine: SearchEngineId) => void;
  onSearch: (query: string, engine: SearchEngineId) => void;
  initialQuery?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  currentEngine,
  onEngineChange,
  onSearch,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsEngineMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim(), currentEngine);
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

  return (
    <div id="search-section" className="w-full max-w-2xl mx-auto px-2">
      {/* Main Search Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center bg-slate-900/90 backdrop-blur-xl border rounded-2xl shadow-xl transition-all duration-300 ${
            isFocused
              ? 'border-amber-400/80 ring-2 ring-amber-500/30 shadow-amber-500/10'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          {/* Engine Selector inside input */}
          <div ref={menuRef} className="relative pr-2 pl-1">
            <button
              id="search-engine-dropdown-trigger"
              type="button"
              onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700/50"
              title="تغيير محرك البحث"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentEngineObj.iconColor }}
              />
              <span className="hidden sm:inline">{currentEngineObj.nameAr}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isEngineMenuOpen && (
              <div
                id="engine-dropdown-menu"
                className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 mb-1 border-b border-slate-800">
                  اختر محرك البحث الافتراضي:
                </div>
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: engine.iconColor }}
                        />
                        <span>{engine.nameAr}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans">{engine.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              id="main-browser-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={currentEngineObj.placeholder}
              className="w-full bg-transparent py-3.5 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-medium"
              dir="auto"
            />

            {/* Clear Button */}
            {query && (
              <button
                id="clear-search-query-btn"
                type="button"
                onClick={() => {
                  setQuery('');
                  if (inputRef.current) inputRef.current.focus();
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
              className={`p-2 rounded-xl transition cursor-pointer ${
                isVoiceListening
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
              }`}
              title="البحث الصوتي"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              id="submit-search-btn"
              type="submit"
              className="flex items-center justify-center p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
              title="بحث"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Voice Assistant listening badge */}
      {isVoiceListening && (
        <div className="mt-2 text-center text-xs text-amber-400 font-medium animate-pulse flex items-center justify-center gap-1.5 bg-slate-900/80 py-1.5 px-3 rounded-full border border-amber-500/30 w-fit mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>جاري الاستماع لصوتك عبر متصفح الأسد...</span>
        </div>
      )}

      {/* Smart search quick tags */}
      {isFocused && !query && (
        <div className="mt-2 bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md">
          <div className="text-[11px] font-bold text-slate-400 px-2 mb-1.5 flex items-center justify-between">
            <span>اقتراحات بحث شائعة وسريعة:</span>
            <span className="text-[10px] text-amber-400/80">Lion Turbo Cache</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {popularSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item.text);
                  onSearch(item.text, currentEngine);
                }}
                className="flex items-center gap-2 p-2 rounded-xl text-xs text-right text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition text-truncate"
              >
                <Search className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
