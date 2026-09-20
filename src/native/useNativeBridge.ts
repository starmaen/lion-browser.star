import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { LionWebView, isNativeApp, nativeUrlByTab } from './lionWebView';
import type { PluginListenerHandle } from '@capacitor/core';
import type { BrowserTab, HistoryItem, DownloadItem } from '../types';

export interface NativeNav {
  canGoBack: boolean;
  canGoForward: boolean;
  loading: boolean;
  progress: number;
}

interface Options {
  activeTabId: string;
  setTabs: Dispatch<SetStateAction<BrowserTab[]>>;
  setHistory: Dispatch<SetStateAction<HistoryItem[]>>;
  setDownloads: Dispatch<SetStateAction<DownloadItem[]>>;
  onGoHome: () => void;
  onToast: (msg: string) => void;
}

const fmtSize = (b?: number) => {
  if (!b || b <= 0) return '—';
  if (b < 1024 * 1024) return `${Math.max(1, Math.round(b / 1024))} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const fileTypeOf = (name: string): DownloadItem['fileType'] => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['mp4', 'mkv', 'webm', 'mov', 'avi', '3gp'].includes(ext)) return 'video';
  if (['mp3', 'm4a', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) return 'audio';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
  if (ext === 'apk') return 'apk';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(ext)) return 'document';
  return 'other';
};

/**
 * يربط الـ WebView الأصلي بحالة التطبيق: عنوان الصفحة، العنوان، السجل، التنزيلات، زر الرجوع.
 * لا يفعل شيئاً خارج تطبيق الأندرويد.
 */
export function useNativeBridge(opts: Options): NativeNav {
  const [nav, setNav] = useState<NativeNav>({ canGoBack: false, canGoForward: false, loading: false, progress: 0 });
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!isNativeApp) return;
    const handles: Promise<PluginListenerHandle>[] = [];

    handles.push(
      LionWebView.addListener('pageInfo', (info) => {
        const o = optsRef.current;
        const validUrl = !!info.url && !info.url.startsWith('about:');
        if (validUrl) nativeUrlByTab[info.tabId] = info.url;

        o.setTabs((prev) =>
          prev.map((t) =>
            t.id === info.tabId
              ? {
                  ...t,
                  url: validUrl ? info.url : t.url,
                  title: info.title || (validUrl ? info.url : t.title),
                  isLoading: info.loading,
                }
              : t
          )
        );

        if (info.tabId === o.activeTabId) {
          setNav({
            canGoBack: info.canGoBack,
            canGoForward: info.canGoForward,
            loading: info.loading,
            progress: info.progress,
          });
        }

        if (validUrl && !info.loading) {
          o.setHistory((prev) => {
            if (prev[0] && prev[0].url === info.url) return prev;
            const entry: HistoryItem = {
              id: 'hist-' + Date.now(),
              title: info.title || info.url,
              url: info.url,
              timestamp: 'الآن',
              date: new Date().toISOString().split('T')[0],
              timeMs: Date.now(),
            };
            return [entry, ...prev.slice(0, 199)];
          });
        }
      })
    );

    handles.push(LionWebView.addListener('backAtRoot', () => optsRef.current.onGoHome()));

    handles.push(
      LionWebView.addListener('downloadStarted', (e) => {
        const name = e.fileName || 'file';
        const item: DownloadItem = {
          id: 'native-' + e.id,
          fileName: name,
          fileType: fileTypeOf(name),
          fileSize: fmtSize(e.sizeBytes),
          progress: 0,
          status: 'downloading',
          sourceUrl: e.url || '',
          downloadDate: 'الآن',
        };
        optsRef.current.setDownloads((prev) => [item, ...prev.filter((d) => d.id !== item.id)]);
        optsRef.current.onToast('بدأ التنزيل: ' + name);
      })
    );

    handles.push(
      LionWebView.addListener('downloadProgress', (e) => {
        optsRef.current.setDownloads((prev) =>
          prev.map((d) =>
            d.id === 'native-' + e.id
              ? {
                  ...d,
                  progress: e.progress ?? d.progress,
                  status: e.status ?? d.status,
                  fileSize: e.sizeBytes ? fmtSize(e.sizeBytes) : d.fileSize,
                }
              : d
          )
        );
        if (e.status === 'completed') optsRef.current.onToast('اكتمل التنزيل ✅');
        if (e.status === 'failed') optsRef.current.onToast('فشل التنزيل ❌');
      })
    );

    handles.push(
      LionWebView.addListener('downloadError', (e) => {
        optsRef.current.onToast(e.message || 'تعذّر بدء التنزيل');
      })
    );

    return () => {
      handles.forEach((h) => h.then((x) => x.remove()).catch(() => {}));
    };
  }, []);

  return nav;
}
