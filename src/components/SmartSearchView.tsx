import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Globe,
  ArrowRight,
  RefreshCw,
  Info,
  Maximize2,
  ChevronRight,
  Smartphone,
} from 'lucide-react';
import { SearchEngineId } from '../types';
import { SEARCH_ENGINES } from '../data/initialData';

interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  domain?: string;
}

interface SmartSearchViewProps {
  initialQuery: string;
  initialEngine: SearchEngineId;
  currentUrl: string;
  onNavigateTo: (url: string, title?: string) => void;
  onOpenDirectExternal: (url: string) => void;
  onToggleToIframe: () => void;
  onOpenApkModal?: () => void;
  currentLanguage?: string;
}

export const SmartSearchView: React.FC<SmartSearchViewProps> = ({
  initialQuery,
  initialEngine,
  currentUrl,
  onNavigateTo,
  onOpenDirectExternal,
  onToggleToIframe,
  onOpenApkModal,
  currentLanguage = 'ar',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedEngine, setSelectedEngine] = useState<SearchEngineId>(initialEngine);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [instantAnswer, setInstantAnswer] = useState<{ heading?: string; abstract?: string; source?: string } | null>(null);

  // Parse query from currentUrl if initialQuery is empty
  useEffect(() => {
    let extractedQuery = initialQuery;
    if (!extractedQuery && currentUrl) {
      try {
        const parsed = new URL(currentUrl);
        extractedQuery =
          parsed.searchParams.get('q') ||
          parsed.searchParams.get('text') ||
          parsed.searchParams.get('query') ||
          '';
      } catch {
        // ignore
      }
    }
    if (extractedQuery) {
      setQuery(extractedQuery);
      fetchLiveResults(extractedQuery);
    }
  }, [initialQuery, currentUrl]);

  // Fetch live fast search results via Wikipedia/DuckDuckGo open endpoints
  const fetchLiveResults = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setInstantAnswer(null);

    try {
      // 1. DuckDuckGo Instant Answers & Topics (JSON API)
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(ddgUrl);
      const data = await res.json();

      const items: SearchResultItem[] = [];

      if (data.AbstractText) {
        setInstantAnswer({
          heading: data.Heading || q,
          abstract: data.AbstractText,
          source: data.AbstractSource || 'DuckDuckGo Knowledge',
        });
      }

      if (Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.slice(0, 6).forEach((topic: { Text?: string; FirstURL?: string }) => {
          if (topic.Text && topic.FirstURL) {
            const domain = new URL(topic.FirstURL).hostname.replace('www.', '');
            items.push({
              title: topic.Text.slice(0, 75) + '...',
              snippet: topic.Text,
              url: topic.FirstURL,
              domain,
            });
          }
        });
      }

      // If few results, complement with Wikipedia open search API
      if (items.length < 3) {
        try {
          const wikiUrl = `https://ar.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
            q
          )}&limit=5&namespace=0&format=json&origin=*`;
          const wikiRes = await fetch(wikiUrl);
          const wikiData = await wikiRes.json();
          const titles = wikiData[1] || [];
          const snippets = wikiData[2] || [];
          const links = wikiData[3] || [];

          for (let i = 0; i < titles.length; i++) {
            if (links[i]) {
              items.push({
                title: titles[i],
                snippet: snippets[i] || `مقال وموسوعة شاملة حول ${titles[i]} عبر ويكيبيديا.`,
                url: links[i],
                domain: 'ar.wikipedia.org',
              });
            }
          }
        } catch {
          // ignore wiki error
        }
      }

      // Fallback sample mock results if offline or blocked
      if (items.length === 0) {
        items.push(
          {
            title: `نتائج بحث مباشرة: ${q}`,
            snippet: `استكشف أحدث المقالات والمصادر المتعلقة بـ "${q}" عبر محرك البحث المباشر.`,
            url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
            domain: 'google.com',
          },
          {
            title: `دليل وموسوعة المعلومات حول: ${q}`,
            snippet: `تصفح التفاصيل الكاملة والحقائق الموثقة والأخبار التقنية واليومية لـ "${q}".`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
            domain: 'duckduckgo.com',
          },
          {
            title: `بحث ياندكس العالمي: ${q}`,
            snippet: `معلومات سريعة وصور وملفات ذات صلة بكلمة البحث "${q}".`,
            url: `https://yandex.com/search/?text=${encodeURIComponent(q)}`,
            domain: 'yandex.com',
          }
        );
      }

      setResults(items);
    } catch {
      // Fallback
      setResults([
        {
          title: `بحث سريع في غوغل: ${q}`,
          snippet: `انقر للفتح المباشر واستعراض النتائج الكاملة بدون قيود الحماية.`,
          url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
          domain: 'google.com',
        },
        {
          title: `بحث دوك دوك جو الخاص: ${q}`,
          snippet: `تصفح آمن وخاص بدون تتبع الإعلانات.`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
          domain: 'duckduckgo.com',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchLiveResults(query.trim());
  };

  const getDirectEngineUrl = (eng: SearchEngineId, q: string) => {
    const engineObj = SEARCH_ENGINES[eng];
    return `${engineObj.searchUrl}${encodeURIComponent(q || 'اخبار التكنولوجيا')}`;
  };

  return (
    <div className="w-full flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto p-3 sm:p-6 pb-20 select-text">
      {/* Notice Banner explaining the preview iFrame vs Android APK */}
      <div className="w-full max-w-3xl mx-auto mb-4 bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-black text-amber-300 text-sm mb-1 flex items-center gap-2">
              <span>لماذا تظهر رسالة "رفض الاتصال" لغوغل وياندكس في المعاينة فقط؟</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                محلولة في تطبيق الهاتف
              </span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              محركات البحث العالمية مثل <strong>Google</strong> و <strong>Yandex</strong> و <strong>DuckDuckGo</strong> تمنع
              أمنياً التضمين داخل إطارات الويب (iFrame) لتفادي هجمات الاحتيال.
              <br />
              <strong className="text-emerald-400">في تطبيق الأندرويد النهائي (APK أو PWA):</strong> يتم التصفح عبر
              محرك <strong>Android WebView</strong> الحقيقي، حيث تفتح جميع مواقع غوغل وياندكس وكل صفحات الويب فوراً وبدون أي اعتراض أو حجب!
            </p>

            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenDirectExternal(getDirectEngineUrl(selectedEngine, query))}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح {SEARCH_ENGINES[selectedEngine]?.nameAr} مباشرة بنافذة كاملة</span>
              </button>

              {onOpenApkModal && (
                <button
                  type="button"
                  onClick={onOpenApkModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>تثبيت / تنزيل تطبيق الهاتف APK</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleToIframe}
                className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition cursor-pointer"
              >
                تجربة الإطار المضمّن (iFrame)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Bar Card */}
      <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl mb-6">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الويب أو أدخل كلمة بحث..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3 pl-10 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl transition cursor-pointer font-bold shadow"
            title="بحث"
          >
            <Search className="w-4 h-4" />
          </button>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute left-3 text-slate-500 hover:text-slate-300 text-xs font-bold"
            >
              مسح
            </button>
          )}
        </form>

        {/* Engine Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pt-2 border-t border-slate-800 scrollbar-none">
          <span className="text-[11px] text-slate-400 font-bold shrink-0 ml-1">محرك البحث:</span>
          {(Object.keys(SEARCH_ENGINES) as SearchEngineId[]).map((engKey) => {
            const eng = SEARCH_ENGINES[engKey];
            const isSelected = selectedEngine === engKey;
            return (
              <button
                key={eng.id}
                type="button"
                onClick={() => {
                  setSelectedEngine(engKey);
                  fetchLiveResults(query);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: eng.iconColor }}
                />
                <span>{eng.nameAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Knowledge Box if available */}
      {instantAnswer && (
        <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-4 sm:p-5 shadow-xl mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-300 font-black text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>إجابة فورية ذكية</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{instantAnswer.source}</span>
          </div>
          {instantAnswer.heading && (
            <h3 className="text-base sm:text-lg font-black text-amber-300 mb-1.5">
              {instantAnswer.heading}
            </h3>
          )}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {instantAnswer.abstract}
          </p>
        </div>
      )}

      {/* Live Results Stream */}
      <div className="w-full max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>النتائج المباشرة لـ "{query || 'البحث'}"</span>
            {isLoading && <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />}
          </h3>

          <button
            type="button"
            onClick={() => onOpenDirectExternal(getDirectEngineUrl(selectedEngine, query))}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <span>استعراض في {SEARCH_ENGINES[selectedEngine]?.nameAr} بالكامل</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {results.map((res, index) => (
          <div
            key={index}
            className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/30 rounded-2xl p-4 transition-all duration-200 shadow group"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                  <Globe className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-[320px]">
                  {res.domain || res.url}
                </span>
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                title="فتح في نافذة خارجية"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <h4
              onClick={() => onNavigateTo(res.url, res.title)}
              className="text-sm sm:text-base font-bold text-amber-400 hover:text-amber-300 cursor-pointer transition mb-1 leading-snug group-hover:underline"
            >
              {res.title}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">{res.snippet}</p>

            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => onNavigateTo(res.url, res.title)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>تصفح الصفحة في متصفح الأسد</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => onOpenDirectExternal(res.url)}
                className="text-slate-400 hover:text-slate-200 text-[11px] font-medium"
              >
                فتح مباشر
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
