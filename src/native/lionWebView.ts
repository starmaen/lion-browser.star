import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

/** true فقط داخل تطبيق الأندرويد (APK)، وfalse في المتصفح العادي */
export const isNativeApp: boolean = Capacitor.isNativePlatform();

export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PageInfo {
  tabId: string;
  url: string;
  title: string;
  loading: boolean;
  progress: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface NativeDownloadEvent {
  id: string;
  fileName?: string;
  mimeType?: string;
  url?: string;
  status?: 'downloading' | 'completed' | 'paused' | 'failed';
  progress?: number;
  sizeBytes?: number;
  message?: string;
}

export interface LionWebViewPlugin {
  activate(o: Bounds & { tabId: string; url: string; desktop?: boolean }): Promise<void>;
  setBounds(o: Bounds): Promise<void>;
  loadUrl(o: { tabId: string; url: string }): Promise<void>;
  show(): Promise<void>;
  hide(): Promise<void>;
  goBack(): Promise<void>;
  goForward(): Promise<void>;
  reload(): Promise<void>;
  stop(): Promise<void>;
  closeTab(o: { tabId: string }): Promise<void>;
  setDesktopMode(o: { tabId: string; enabled: boolean }): Promise<void>;
  clearData(o: { cache: boolean; cookies: boolean; history: boolean }): Promise<void>;
  openDownload(o: { id: string }): Promise<void>;
  cancelDownload(o: { id: string }): Promise<void>;
  addListener(eventName: 'pageInfo', cb: (i: PageInfo) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'backAtRoot', cb: () => void): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'downloadStarted' | 'downloadProgress' | 'downloadError',
    cb: (e: NativeDownloadEvent) => void
  ): Promise<PluginListenerHandle>;
}

export const LionWebView = registerPlugin<LionWebViewPlugin>('LionWebView');

/** آخر عنوان أبلغ عنه الـ WebView الأصلي لكل تبويب (لمنع إعادة التحميل المتكررة) */
export const nativeUrlByTab: Record<string, string> = {};

export const closeNativeTab = (tabId: string) => {
  if (!isNativeApp) return;
  delete nativeUrlByTab[tabId];
  LionWebView.closeTab({ tabId }).catch(() => {});
};
