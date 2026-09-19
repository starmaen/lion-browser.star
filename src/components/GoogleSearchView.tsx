import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mic,
  Camera,
  ExternalLink,
  Globe,
  Sparkles,
  ArrowRight,
  X,
  RefreshCw,
  Image as ImageIcon,
  Newspaper,
  Video,
  MapPin,
  Compass,
  Layers,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  domain?: string;
}

interface GoogleSearchViewProps {
  initialQuery: string;
  currentUrl: string;
  onNavigateTo: (url: string, title?: string) => void;
  onOpenDirectExternal: (url: string) => void;
  onToggleToDuckDuckGo?: () => void;
  onToggleToIframe: () => void;
  onOpenApkModal?: () => void;
  currentLanguage?: string;
}

export const GoogleSearchView: React.FC<GoogleSearchViewProps> = ({
  initialQuery,
  currentUrl,
  onNavigateTo,
  onOpenDirectExternal,
  onToggleToDuckDuckGo,
  onToggleToIframe,
  onOpenApkModal,
  currentLanguage = 'ar',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTime, setSearchTime] = useState(0.24);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'news' | 'videos' | 'maps'>('all');
  const [instantAnswer, setInstantAnswer] = useState<{ heading?: string; abstract?: string; source?: string } | null>(null);
  const [relatedSearches, setRelatedSearches] = useState<string[]>([]);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Extract query from URL if initialQuery is empty
  useEffect(() => {
    let q = initialQuery;
    if (!q && currentUrl) {
      try {
        const urlObj = new URL(currentUrl);
        q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '';
      } catch {
        // fallback regex
        const match = currentUrl.match(/[?&]q=([^&]+)/);
        if (match) q = decodeURIComponent(match[1]);
      }
    }
    if (q) {
      setQuery(q);
      setInputVal(q);
      executeSearch(q);
    } else {
      // Default initial search
      const defaultQ = currentLanguage === 'ar' ? 'أخبار اليوم' : 'Latest news';
      setQuery(defaultQ);
      setInputVal(defaultQ);
      executeSearch(defaultQ);
    }
  }, [initialQuery, currentUrl]);

  // Autocomplete suggestions as user types
  useEffect(() => {
    if (!inputVal.trim() || inputVal === query) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(inputVal.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data);
          }
        }
      } catch {
        // ignore
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [inputVal, query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setShowSuggestions(false);
    const startTime = performance.now();

    try {
      const res = await fetch(`/api/search/live?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setInstantAnswer(data.instantAnswer || null);
        setRelatedSearches(data.related || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setSearchTime(parseFloat(elapsed) || 0.28);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setQuery(inputVal.trim());
    executeSearch(inputVal.trim());
  };

  const handleSuggestionClick = (sug: string) => {
    setInputVal(sug);
    setQuery(sug);
    setShowSuggestions(false);
    executeSearch(sug);
  };

  const officialGoogleUrl = `https://www.google.com/search?q=${encodeURIComponent(query || 'google')}`;

  return (
    <div className="flex-1 w-full h-full bg-[#202124] text-[#e8eaed] overflow-y-auto flex flex-col font-sans select-text">
      {/* Top Google Header */}
      <div className="sticky top-0 z-30 bg-[#202124] border-b border-[#3c4043] px-3 sm:px-6 py-2.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Google Logo */}
            <div
              className="flex items-center cursor-pointer select-none font-bold text-xl sm:text-2xl tracking-tighter shrink-0"
              onClick={() => {
                const homeQ = currentLanguage === 'ar' ? 'أخبار اليوم' : 'technology';
                setInputVal(homeQ);
                setQuery(homeQ);
                executeSearch(homeQ);
              }}
              title="Google"
            >
              <span className="text-[#4285f4]">G</span>
              <span className="text-[#ea4335]">o</span>
              <span className="text-[#fbbc05]">o</span>
              <span className="text-[#4285f4]">g</span>
              <span className="text-[#34a853]">l</span>
              <span className="text-[#ea4335]">e</span>
            </div>

            {/* Search Input Box */}
            <div ref={searchBoxRef} className="relative flex-1">
              <form
                onSubmit={handleFormSubmit}
                className="flex items-center w-full bg-[#303134] hover:bg-[#3c4043] focus-within:bg-[#303134] focus-within:ring-1 focus-within:ring-[#8ab4f8] rounded-full px-3.5 py-2 transition-all border border-transparent focus-within:border-transparent shadow-md"
              >
                <Search className="w-4 h-4 text-[#9aa0a6] shrink-0 me-2.5" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={currentLanguage === 'ar' ? 'بحث في Google أو كتابة عنوان...' : 'Search Google or type a URL...'}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#e8eaed] placeholder-[#9aa0a6]"
                  dir="auto"
                />
                {inputVal && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputVal('');
                      setSuggestions([]);
                    }}
                    className="p-1 text-[#9aa0a6] hover:text-[#e8eaed] rounded-full hover:bg-white/10 me-1"
                    title={currentLanguage === 'ar' ? 'مسح' : 'Clear'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="h-4 w-px bg-[#5f6368] mx-1.5 hidden sm:block" />
                <button
                  type="button"
                  onClick={() => executeSearch(inputVal)}
                  className="p-1.5 text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-full transition-colors"
                  title={currentLanguage === 'ar' ? 'بحث' : 'Search'}
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full start-0 end-0 mt-1 bg-[#303134] border border-[#5f6368]/40 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(sug)}
                      className="w-full flex items-center px-4 py-2 text-sm text-[#e8eaed] hover:bg-[#3c4043] text-start transition-colors gap-3"
                    >
                      <Search className="w-3.5 h-3.5 text-[#9aa0a6] shrink-0" />
                      <span className="truncate">{sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Link to Official Google */}
            <button
              type="button"
              onClick={() => onOpenDirectExternal(officialGoogleUrl)}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#8ab4f8]/15 hover:bg-[#8ab4f8]/25 text-[#8ab4f8] rounded-full border border-[#8ab4f8]/30 transition-all shrink-0"
              title={currentLanguage === 'ar' ? 'فتح في موقع Google الرسمي' : 'Open in Official Google'}
            >
              <span>{currentLanguage === 'ar' ? 'Google الرسمي' : 'Official Google'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Google Search Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-1 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#8ab4f8]/15 text-[#8ab4f8] font-bold border border-[#8ab4f8]/40'
                  : 'text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#303134]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'ar' ? 'الكل' : 'All'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('news');
                executeSearch(`${query} أخبار`);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                activeTab === 'news'
                  ? 'bg-[#8ab4f8]/15 text-[#8ab4f8] font-bold border border-[#8ab4f8]/40'
                  : 'text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#303134]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'ar' ? 'أخبار' : 'News'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('images');
                onNavigateTo(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                activeTab === 'images'
                  ? 'bg-[#8ab4f8]/15 text-[#8ab4f8] font-bold border border-[#8ab4f8]/40'
                  : 'text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#303134]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'ar' ? 'صور' : 'Images'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('videos');
                onNavigateTo(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                activeTab === 'videos'
                  ? 'bg-[#8ab4f8]/15 text-[#8ab4f8] font-bold border border-[#8ab4f8]/40'
                  : 'text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#303134]'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'ar' ? 'فيديوهات' : 'Videos'}</span>
            </button>

            {onToggleToDuckDuckGo && (
              <button
                type="button"
                onClick={onToggleToDuckDuckGo}
                className="ms-auto flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-full border border-amber-500/30 whitespace-nowrap transition-colors"
                title={currentLanguage === 'ar' ? 'التبديل إلى DuckDuckGo المباشر' : 'Switch to DuckDuckGo Engine'}
              >
                <span>🦆 DuckDuckGo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
        {/* Results Metadata & Search Tools */}
        <div className="flex items-center justify-between text-xs text-[#9aa0a6] border-b border-[#3c4043]/50 pb-2">
          <span>
            {currentLanguage === 'ar'
              ? `حوالي ${results.length > 0 ? (results.length * 1420).toLocaleString() : '0'} نتيجة (${searchTime} ثانية)`
              : `About ${results.length > 0 ? (results.length * 1420).toLocaleString() : '0'} results (${searchTime} seconds)`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => executeSearch(query)}
              className="flex items-center gap-1 text-[#8ab4f8] hover:underline"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{currentLanguage === 'ar' ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#303134]" />
                  <div className="w-32 h-3 rounded bg-[#303134]" />
                </div>
                <div className="w-3/4 h-5 rounded bg-[#3c4043]" />
                <div className="w-full h-12 rounded bg-[#303134]" />
              </div>
            ))}
          </div>
        )}

        {/* Instant Answer / Knowledge Graph Card */}
        {!isLoading && instantAnswer && instantAnswer.abstract && (
          <div className="bg-[#303134] border border-[#3c4043] rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8ab4f8] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {instantAnswer.heading || query}
              </span>
              <span className="text-[11px] text-[#9aa0a6]">{instantAnswer.source}</span>
            </div>
            <p className="text-sm text-[#e8eaed] leading-relaxed" dir="auto">
              {instantAnswer.abstract}
            </p>
          </div>
        )}

        {/* Search Results List */}
        {!isLoading && results.length > 0 && (
          <div className="flex flex-col gap-6">
            {results.map((res, index) => (
              <article key={index} className="flex flex-col group">
                {/* Domain & Favicon */}
                <div className="flex items-center gap-2 mb-1 text-xs text-[#bdc1c6] truncate">
                  <div className="w-5 h-5 rounded-full bg-[#303134] border border-[#3c4043] flex items-center justify-center text-[10px] text-[#8ab4f8] font-bold shrink-0">
                    <Globe className="w-3 h-3 text-[#9aa0a6]" />
                  </div>
                  <div className="flex items-center gap-1 text-[13px] truncate">
                    <span className="font-medium text-[#e8eaed]">{res.domain || 'web'}</span>
                    <span className="text-[#9aa0a6] text-xs">›</span>
                    <span className="text-[#9aa0a6] text-xs truncate">{res.url}</span>
                  </div>
                </div>

                {/* Title (Clickable) */}
                <h3 className="text-lg sm:text-xl font-normal text-[#8ab4f8] group-hover:underline cursor-pointer leading-snug mb-1">
                  <a
                    href={res.url}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateTo(res.url, res.title);
                    }}
                    dir="auto"
                  >
                    {res.title}
                  </a>
                </h3>

                {/* Snippet */}
                <p className="text-sm text-[#bdc1c6] leading-relaxed" dir="auto">
                  {res.snippet}
                </p>

                {/* Quick actions for result */}
                <div className="flex items-center gap-3 mt-2 text-xs text-[#9aa0a6]">
                  <button
                    type="button"
                    onClick={() => onNavigateTo(res.url, res.title)}
                    className="flex items-center gap-1 hover:text-[#8ab4f8] transition-colors"
                  >
                    <span>{currentLanguage === 'ar' ? 'فتح في المتصفح' : 'Open in Browser'}</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenDirectExternal(res.url)}
                    className="flex items-center gap-1 hover:text-[#8ab4f8] transition-colors"
                  >
                    <span>{currentLanguage === 'ar' ? 'نافذة جديدة' : 'New Tab'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && (
          <div className="bg-[#303134] border border-[#3c4043] rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <Search className="w-10 h-10 text-[#9aa0a6]" />
            <h4 className="text-base font-semibold text-[#e8eaed]">
              {currentLanguage === 'ar' ? `لم يتم العثور على نتائج لـ "${query}"` : `No results found for "${query}"`}
            </h4>
            <p className="text-xs text-[#9aa0a6] max-w-md leading-relaxed">
              {currentLanguage === 'ar'
                ? 'تأكد من كتابة الكلمات بشكل صحيح، أو جرب كلمات بحث أعم، أو افتح محرك Google الرسمي مباشرة.'
                : 'Check your spelling or try different keywords, or open the official Google search engine directly.'}
            </p>
            <button
              type="button"
              onClick={() => onOpenDirectExternal(officialGoogleUrl)}
              className="mt-2 px-5 py-2 bg-[#8ab4f8] text-[#202124] font-bold text-xs rounded-full hover:bg-[#aecbfa] transition-all flex items-center gap-1.5"
            >
              <span>{currentLanguage === 'ar' ? 'البحث عبر Google الرسمي' : 'Search on Official Google'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Related Searches Pills */}
        {!isLoading && relatedSearches.length > 0 && (
          <div className="border-t border-[#3c4043] pt-5 mt-4 flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-[#e8eaed] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#8ab4f8]" />
              <span>{currentLanguage === 'ar' ? 'عمليات بحث ذات صلة' : 'Related searches'}</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {relatedSearches.map((term, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(term)}
                  className="px-3.5 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e8eaed] text-xs sm:text-sm rounded-full border border-[#5f6368]/40 transition-colors flex items-center gap-2"
                >
                  <Search className="w-3 h-3 text-[#9aa0a6]" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="border-t border-[#3c4043] pt-6 pb-12 mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDirectExternal(officialGoogleUrl)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#8ab4f8] rounded-xl border border-[#3c4043] transition-colors"
            >
              <span>🌐 {currentLanguage === 'ar' ? 'فتح Google الرسمي بنافذة كاملة' : 'Open Official Google'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {onToggleToDuckDuckGo && (
              <button
                type="button"
                onClick={onToggleToDuckDuckGo}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#303134] hover:bg-[#3c4043] text-amber-300 rounded-xl border border-[#3c4043] transition-colors"
              >
                <span>🦆 {currentLanguage === 'ar' ? 'محرك DuckDuckGo المباشر' : 'DuckDuckGo Engine'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleToIframe}
            className="text-[#9aa0a6] hover:text-[#e8eaed] underline text-xs"
          >
            {currentLanguage === 'ar' ? 'تجربة وضع الإطار المباشر (Raw Iframe)' : 'Try Raw Iframe Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};
