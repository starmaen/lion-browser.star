import React, { useEffect, useRef } from 'react';
import { LionWebView, nativeUrlByTab } from '../native/lionWebView';

interface Props {
  tabId: string;
  url: string;
  hidden: boolean;
  desktopMode: boolean;
  loading: boolean;
  progress: number;
}

/**
 * مساحة فارغة في الواجهة؛ يوضع فوقها WebView أصلي حقيقي (Chromium) بنفس المقاس.
 * كل شيء آخر (شريط العنوان، النوافذ، القوائم) يبقى واجهة React كما هي.
 */
export const NativeWebViewHost: React.FC<Props> = ({ tabId, url, hidden, desktopMode, loading, progress }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const urlRef = useRef(url);
  urlRef.current = url;
  const desktopRef = useRef(desktopMode);
  desktopRef.current = desktopMode;
  const firstDesktop = useRef(true);

  const measure = () => {
    const el = hostRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  };

  // إظهار/إخفاء + تبديل التبويب
  useEffect(() => {
    if (hidden) {
      LionWebView.hide().catch(() => {});
      return;
    }
    const b = measure();
    if (!b) return;
    nativeUrlByTab[tabId] = urlRef.current;
    LionWebView.activate({ tabId, url: urlRef.current, desktop: desktopRef.current, ...b }).catch(() => {});
  }, [tabId, hidden]);

  // تغيّر العنوان من الواجهة (كتابة رابط أو بحث)
  useEffect(() => {
    if (!url || nativeUrlByTab[tabId] === url) return;
    nativeUrlByTab[tabId] = url;
    if (!hidden) LionWebView.loadUrl({ tabId, url }).catch(() => {});
  }, [url]);

  // وضع سطح المكتب
  useEffect(() => {
    if (firstDesktop.current) {
      firstDesktop.current = false;
      return;
    }
    LionWebView.setDesktopMode({ tabId, enabled: desktopMode }).catch(() => {});
  }, [desktopMode]);

  // متابعة مكان ومقاس المساحة (لوحة المفاتيح، التدوير، الشريط…)
  useEffect(() => {
    if (hidden) return;
    let last = '';
    const send = () => {
      const b = measure();
      if (!b) return;
      const key = [b.left, b.top, b.width, b.height].map((n) => Math.round(n)).join(',');
      if (key === last) return;
      last = key;
      LionWebView.setBounds(b).catch(() => {});
    };
    const timer = window.setInterval(send, 250);
    window.addEventListener('resize', send);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(send) : null;
    if (ro && hostRef.current) ro.observe(hostRef.current);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', send);
      ro?.disconnect();
    };
  }, [hidden, tabId]);

  // عند مغادرة الشاشة (الرجوع للرئيسية) أخفِ الـ WebView
  useEffect(() => {
    return () => {
      LionWebView.hide().catch(() => {});
    };
  }, []);

  return (
    <div className="relative flex-1 w-full flex flex-col bg-slate-950 overflow-hidden">
      <div className="h-[3px] w-full shrink-0">
        {loading && progress < 100 && (
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${Math.max(progress, 8)}%` }} />
        )}
      </div>
      <div ref={hostRef} className="flex-1 w-full" />
    </div>
  );
};
