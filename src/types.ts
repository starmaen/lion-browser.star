export type SearchEngineId = 'google' | 'bing' | 'yandex' | 'duckduckgo';

export interface AppLanguage {
  code: string;
  name: string;
  nativeName: string;
  dir: 'rtl' | 'ltr';
  flag: string;
  isCustom?: boolean;
}

export interface SearchEngine {
  id: SearchEngineId;
  name: string;
  nameAr: string;
  searchUrl: string;
  iconColor: string;
  placeholder: string;
}

export interface QuickShortcut {
  id: string;
  title: string;
  titleAr: string;
  url: string;
  iconName: string;
  bgColor: string;
  textColor: string;
  category: 'social' | 'dev' | 'tools';
  isAppShortcut?: boolean;
}

export interface SavedPassword {
  id: string;
  siteName: string;
  siteUrl: string;
  username: string;
  password: string;
  updatedAt: string;
  strength: 'weak' | 'medium' | 'strong';
}

export interface VpnServer {
  id: string;
  country: string;
  countryAr: string;
  city: string;
  cityAr: string;
  flag: string;
  ping: number;
  load: number;
  ip: string;
  isFree: boolean;
}

export interface VpnState {
  isConnected: boolean;
  activeServer: VpnServer;
  connectedSince: number | null;
  bytesDown: number;
  bytesUp: number;
  killSwitchEnabled: boolean;
  netShieldEnabled: boolean;
}

export interface PrivacyStats {
  adsBlocked: number;
  trackersBlocked: number;
  httpsUpgrades: number;
  dataSavedMB: number;
  estimatedBatterySavedPercent: number;
  adBlockActive: boolean;
  trackerBlockActive: boolean;
  fingerprintShieldActive: boolean;
  strictHttpsActive: boolean;
}

export interface GoogleAccount {
  isSignedIn: boolean;
  name: string;
  email: string;
  avatarUrl: string;
  syncBookmarks: boolean;
  syncPasswords: boolean;
  syncHistory: boolean;
  syncTabs: boolean;
  lastSyncedAt: string;
}

export interface TabFolder {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  isStandaloneApp?: boolean; // launched without browser header
  isSuspended?: boolean; // RAM saver suspended state
  folderId?: string; // ID of the tab group / folder
}

export interface PerformanceSettings {
  batterySaver: boolean;
  ramOptimizer: boolean;
  turboSpeed: boolean;
  preloadPages: boolean;
  hardwareAcceleration: boolean;
  currentRamUsageMB: number;
  ramSavedMB: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  createdAt: string;
  favicon?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: string; // formatted time or relative
  date: string; // YYYY-MM-DD
  timeMs?: number; // timestamp in ms for filtering
  favicon?: string;
}

export interface DownloadItem {
  id: string;
  fileName: string;
  fileType: 'video' | 'audio' | 'document' | 'archive' | 'apk' | 'image' | 'other';
  fileSize: string;
  progress: number; // 0 to 100
  status: 'downloading' | 'completed' | 'paused' | 'failed';
  sourceUrl: string;
  downloadDate: string;
  videoQuality?: string;
  videoStreamUrl?: string;
}

export interface PageImageItem {
  id: string;
  url: string;
  title: string;
  width?: number;
  height?: number;
  size?: string;
  format?: string;
}

export interface VideoMediaItem {
  id: string;
  title: string;
  url: string;
  poster?: string;
  duration?: string;
  fileSize?: string;
  quality?: string;
  sourceType?: 'download' | 'web' | 'local' | 'stream';
}

export interface ClearDataOptions {
  history: boolean;
  cache: boolean;
  cookies: boolean;
  downloadsHistory: boolean;
  formAutoFill: boolean;
  siteSettings: boolean;
  timeRange: 'lastHour' | 'lastDay' | 'lastWeek' | 'allTime';
}
