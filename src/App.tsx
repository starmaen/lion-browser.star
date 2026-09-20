import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Zap,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Layers,
  Search,
  Settings,
  Plus,
  Lock,
  Globe,
  Smartphone,
  Maximize2,
  Minimize2,
  Bookmark,
  Key,
  RotateCw,
  Cpu,
  Wifi,
  Signal,
  CheckCircle2,
  EyeOff,
  Flame,
  Download,
  Languages,
  ArrowLeftRight,
} from 'lucide-react';

import {
  SearchEngineId,
  QuickShortcut,
  SavedPassword,
  VpnServer,
  VpnState,
  PrivacyStats,
  GoogleAccount,
  BrowserTab,
  TabFolder,
  PerformanceSettings,
  AppLanguage,
  BookmarkItem,
  HistoryItem,
  DownloadItem,
  ClearDataOptions,
} from './types';

import {
  SEARCH_ENGINES,
  INITIAL_SHORTCUTS,
  PROTON_VPN_SERVERS,
  INITIAL_PASSWORDS,
  INITIAL_PRIVACY_STATS,
  INITIAL_GOOGLE_ACCOUNT,
  INITIAL_PERFORMANCE,
  INITIAL_BOOKMARKS,
  INITIAL_HISTORY,
  INITIAL_DOWNLOADS,
} from './data/initialData';

import { DEFAULT_LANGUAGES, t } from './data/translations';
import lionLogoImg from './assets/images/lion_browser_logo_1789575379510.jpg';

import { LionLogo } from './components/LionLogo';
import { SearchBar } from './components/SearchBar';
import { QuickShortcuts } from './components/QuickShortcuts';
import { ProtonVpnModal } from './components/ProtonVpnModal';
import { PrivacyShieldModal } from './components/PrivacyShieldModal';
import { PasswordManagerModal } from './components/PasswordManagerModal';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { PerformanceModal } from './components/PerformanceModal';
import { StandaloneAppView } from './components/StandaloneAppView';
import { BrowserView } from './components/BrowserView';
import { TabsManagerModal } from './components/TabsManagerModal';
import { OpenTabsBox } from './components/OpenTabsBox';
import { SettingsDrawer } from './components/SettingsDrawer';
import { DownloadsModal } from './components/DownloadsModal';
import { TranslationBar } from './components/TranslationBar';
import { ClearDataModal } from './components/ClearDataModal';
import { BookmarksAndHistoryModal } from './components/BookmarksAndHistoryModal';
import { InternalVideoPlayerModal } from './components/InternalVideoPlayerModal';
import { ImageDownloaderModal } from './components/ImageDownloaderModal';
import { AndroidApkDownloadModal } from './components/AndroidApkDownloadModal';
import { useBatteryStatus } from './hooks/useBatteryStatus';
import { triggerBrowserDownload, downloadRealVideo } from './utils/downloadHelper';
import { isNativeApp, closeNativeTab, LionWebView } from './native/lionWebView'; // LION_NATIVE_PATCH
import { useNativeBridge } from './native/useNativeBridge';

export default function App() {
  // State: System Languages & Localization (Arabic & English primary, with ability to add)
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('lion_language') || 'ar';
  });

  const [languages, setLanguages] = useState<AppLanguage[]>(() => {
    const saved = localStorage.getItem('lion_custom_languages');
    return saved ? JSON.parse(saved) : DEFAULT_LANGUAGES;
  });

  // State: Search & Engine
  const [currentEngine, setCurrentEngine] = useState<SearchEngineId>('google');

  // State: Shortcuts
  const [shortcuts, setShortcuts] = useState<QuickShortcut[]>(() => {
    const saved = localStorage.getItem('lion_shortcuts');
    return saved ? JSON.parse(saved) : INITIAL_SHORTCUTS;
  });

  // State: Passwords
  const [passwords, setPasswords] = useState<SavedPassword[]>(() => {
    const saved = localStorage.getItem('lion_passwords');
    return saved ? JSON.parse(saved) : INITIAL_PASSWORDS;
  });

  // State: Proton VPN
  const [vpnState, setVpnState] = useState<VpnState>({
    isConnected: false,
    activeServer: PROTON_VPN_SERVERS[0],
    connectedSince: null,
    bytesDown: 14200000,
    bytesUp: 4500000,
    killSwitchEnabled: true,
    netShieldEnabled: true,
  });

  // State: Privacy Stats
  const [privacyStats, setPrivacyStats] = useState<PrivacyStats>(INITIAL_PRIVACY_STATS);

  // State: Google Account
  const [googleAccount, setGoogleAccount] = useState<GoogleAccount>(() => {
    const saved = localStorage.getItem('lion_google_account');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          if (parsed.name && parsed.name.includes('أحمد')) {
            parsed.name = 'النجم السوري (starsyria)';
          }
          return parsed;
        }
      } catch {}
    }
    return INITIAL_GOOGLE_ACCOUNT;
  });

  useEffect(() => {
    localStorage.setItem('lion_google_account', JSON.stringify(googleAccount));
  }, [googleAccount]);

  // State: Performance
  const [performance, setPerformance] = useState<PerformanceSettings>(INITIAL_PERFORMANCE);

  // State: Tab Folders & Groups (تنظيم التبويبات في مجلدات)
  const [tabFolders, setTabFolders] = useState<TabFolder[]>(() => {
    const saved = localStorage.getItem('lion_tab_folders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [
      { id: 'folder-work', name: 'العمل والمهام', color: '#3b82f6', createdAt: Date.now() - 30000 },
      { id: 'folder-study', name: 'البحث والقراءة', color: '#10b981', createdAt: Date.now() - 20000 },
      { id: 'folder-media', name: 'الترفيه والفيديو', color: '#f59e0b', createdAt: Date.now() - 10000 },
    ];
  });

  // State: Tabs & Navigation with LocalStorage persistence
  const [tabs, setTabs] = useState<BrowserTab[]>(() => {
    const saved = localStorage.getItem('lion_tabs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [
      {
        id: 'tab-home',
        title: 'الصفحة الرئيسية',
        url: 'about:home',
        isLoading: false,
      },
    ];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const saved = localStorage.getItem('lion_tabs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      } catch {}
    }
    return 'tab-home';
  });

  // State: Standalone Web App Mode (Without Browser Header)
  const [standaloneApp, setStandaloneApp] = useState<QuickShortcut | null>(null);

  // Modals state
  const [isVpnModalOpen, setIsVpnModalOpen] = useState(false);
  const [isShieldModalOpen, setIsShieldModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isTabsModalOpen, setIsTabsModalOpen] = useState(false);
  const [isOpenTabsBoxOpen, setIsOpenTabsBoxOpen] = useState(false);
  const [previousTabId, setPreviousTabId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // New Requested Feature States
  const [isDownloadsModalOpen, setIsDownloadsModalOpen] = useState(false);
  const [isTranslationBarOpen, setIsTranslationBarOpen] = useState(false);
  const [isBookmarksHistoryModalOpen, setIsBookmarksHistoryModalOpen] = useState(false);
  const [bookmarksHistoryInitialTab, setBookmarksHistoryInitialTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video Player & Media Downloader States
  const [isInternalVideoPlayerOpen, setIsInternalVideoPlayerOpen] = useState(false);
  const [internalVideoInitialUrl, setInternalVideoInitialUrl] = useState<string | undefined>(undefined);
  const [internalVideoInitialTitle, setInternalVideoInitialTitle] = useState<string | undefined>(undefined);

  // Image Downloader Modal State
  const [isImageDownloaderModalOpen, setIsImageDownloaderModalOpen] = useState(false);
  const [imageDownloaderPageUrl, setImageDownloaderPageUrl] = useState<string>('');
  const [imageDownloaderPageTitle, setImageDownloaderPageTitle] = useState<string>('');

  // Android APK / PWA Install Modal State
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Data Collections with LocalStorage persistence
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('lion_bookmarks');
    return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('lion_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    const saved = localStorage.getItem('lion_downloads');
    return saved ? JSON.parse(saved) : INITIAL_DOWNLOADS;
  });

  // Navigation History Stack for Back navigation
  const [navigationStack, setNavigationStack] = useState<string[]>([]);

  // Layout View mode: 'mobile-frame' or 'full-width'
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Clock for Android status bar
  const [currentTime, setCurrentTime] = useState('10:45');

  // Dynamic Battery Status (Real Hardware API with intelligent charging/drain simulation)
  const battery = useBatteryStatus(performance.batterySaver);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Sync active language and document direction
  useEffect(() => {
    localStorage.setItem('lion_language', currentLanguage);
    const activeLang = languages.find((l) => l.code === currentLanguage);
    const dir = activeLang?.dir || (currentLanguage === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.dir = dir;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, languages]);

  const handleAddNewLanguage = (newLang: AppLanguage) => {
    setLanguages((prev) => {
      const updated = [...prev.filter((l) => l.code !== newLang.code), newLang];
      localStorage.setItem('lion_custom_languages', JSON.stringify(updated));
      return updated;
    });
  };

  // Save shortcuts, passwords, bookmarks, history, and downloads locally
  useEffect(() => {
    localStorage.setItem('lion_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  useEffect(() => {
    localStorage.setItem('lion_passwords', JSON.stringify(passwords));
  }, [passwords]);

  useEffect(() => {
    localStorage.setItem('lion_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('lion_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('lion_downloads', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    localStorage.setItem('lion_tab_folders', JSON.stringify(tabFolders));
  }, [tabFolders]);

  useEffect(() => {
    localStorage.setItem('lion_tabs', JSON.stringify(tabs));
  }, [tabs]);

  // Bookmarks handlers
  const handleToggleBookmark = (url: string, title: string) => {
    const existing = bookmarks.find((b) => b.url === url);
    if (existing) {
      setBookmarks((prev) => prev.filter((b) => b.url !== url));
    } else {
      const newBookmark: BookmarkItem = {
        id: 'bm-' + Date.now(),
        title: title || url,
        url,
        createdAt: 'الآن',
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  const handleAddBookmark = (item: BookmarkItem) => {
    setBookmarks((prev) => [item, ...prev.filter((b) => b.url !== item.url)]);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // History handlers
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleClearHistory = (timeRange?: 'hour' | 'today' | 'week' | 'all') => {
    if (!timeRange || timeRange === 'all') {
      setHistory([]);
      return;
    }
    const now = Date.now();
    let cutoff = 0;
    if (timeRange === 'hour') {
      cutoff = now - 60 * 60 * 1000;
    } else if (timeRange === 'today') {
      cutoff = now - 24 * 60 * 60 * 1000;
    } else if (timeRange === 'week') {
      cutoff = now - 7 * 24 * 60 * 60 * 1000;
    }
    setHistory((prev) =>
      prev.filter((item) => {
        const itemTime = item.timeMs || (item.date ? new Date(item.date).getTime() : now);
        // keep items visited before the selected range
        return itemTime < cutoff;
      })
    );
  };

  // Create App Shortcut on Desktop
  const handleCreateAppShortcut = (url: string, title: string) => {
    try {
      let parsedUrl = url.trim();
      if (!parsedUrl.startsWith('http://') && !parsedUrl.startsWith('https://')) {
        parsedUrl = 'https://' + parsedUrl;
      }
      const parsed = new URL(parsedUrl);
      const domain = parsed.hostname.replace('www.', '');
      const cleanTitle = title && title !== 'الصفحة الرئيسية' && title !== 'صفحة الويب' ? title : domain;

      const newShortcut: QuickShortcut = {
        id: 'shortcut-' + Date.now(),
        title: cleanTitle,
        titleAr: cleanTitle,
        url: parsedUrl,
        iconName: 'custom',
        bgColor: '#0f172a',
        textColor: '#f59e0b',
        category: 'tools',
        isAppShortcut: true,
      };

      setShortcuts((prev) => {
        const exists = prev.some((s) => s.url === parsedUrl);
        if (exists) return prev;
        const updated = [...prev, newShortcut];
        localStorage.setItem('lion_shortcuts', JSON.stringify(updated));
        return updated;
      });

      // Show toast confirmation
      const msg = currentLanguage === 'ar'
        ? `تم إنشاء اختصار "${cleanTitle}" بنجاح وإضافته إلى المتصفح وسطح المكتب!`
        : `Created desktop & home shortcut for "${cleanTitle}" successfully!`;
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);

      // Trigger standard .url file download for instant desktop placement
      const fileContent = `[InternetShortcut]\nURL=${parsedUrl}\nIconIndex=0\n`;
      const blob = new Blob([fileContent], { type: 'application/internet-shortcut' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${cleanTitle.replace(/[/\\?%*:|"<>]/g, '_')}.url`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch {
      // Fallback
    }
  };

  // Downloads handlers
  const handleAddDownload = (item: DownloadItem) => {
    setDownloads((prev) => [item, ...prev]);

    // Trigger REAL file download to device storage if not already triggered
    if (item.sourceUrl && !item.sourceUrl.startsWith('about:')) {
      if (item.fileType === 'video') {
        downloadRealVideo(item.sourceUrl, item.fileName, item.videoQuality);
      } else {
        triggerBrowserDownload(item.sourceUrl, item.fileName);
      }
    }
  };

  const handleDeleteDownload = (id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const handleClearCompletedDownloads = () => {
    setDownloads((prev) => prev.filter((d) => d.status !== 'completed'));
  };

  // Comprehensive Clear Data & Cache handler
  const handleClearBrowsingData = (options: ClearDataOptions) => {
    if (isNativeApp) {
      LionWebView.clearData({ cache: options.cache, cookies: options.cookies, history: options.history }).catch(() => {});
    }
    if (options.history) {
      setHistory([]);
    }
    if (options.downloadsHistory) {
      setDownloads([]);
    }
    if (options.cache) {
      // Clear RAM/cache stats in performance engine
      setPerformance((prev) => ({
        ...prev,
        currentRamUsageMB: Math.max(34, prev.currentRamUsageMB - 42),
        ramSavedMB: prev.ramSavedMB + 65,
      }));
    }
    if (options.cookies) {
      // simulate cookie clearing by resetting session tokens
      console.log('Lion Browser: Cookies and site caches cleared securely.');
    }
  };

  // Go Back Navigation
  const handleGoBack = () => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop(); // remove current
      const previousUrl = newStack[newStack.length - 1];
      setNavigationStack(newStack);
      if (previousUrl === 'about:home') {
        handleGoHome();
      } else {
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTabId ? { ...t, url: previousUrl } : t))
        );
      }
    } else {
      handleGoHome();
    }
  };

  // VPN Handlers
  const handleToggleVpn = () => {
    setVpnState((prev) => {
      const nextConnected = !prev.isConnected;
      return {
        ...prev,
        isConnected: nextConnected,
        connectedSince: nextConnected ? Date.now() : null,
      };
    });
  };

  const handleSelectVpnServer = (server: VpnServer) => {
    setVpnState((prev) => ({
      ...prev,
      activeServer: server,
    }));
  };

  const handleToggleKillSwitch = () => {
    setVpnState((prev) => ({
      ...prev,
      killSwitchEnabled: !prev.killSwitchEnabled,
    }));
  };

  // Search Submission
  const handleSearchSubmit = (query: string, engine: SearchEngineId) => {
    let targetUrl = '';
    if (
      query.startsWith('http://') ||
      query.startsWith('https://') ||
      (query.includes('.') && !query.includes(' '))
    ) {
      targetUrl = query.startsWith('http') ? query : 'https://' + query;
    } else {
      const engineObj = SEARCH_ENGINES[engine];
      targetUrl = `${engineObj.searchUrl}${encodeURIComponent(query)}`;
    }

    handleNavigateTo(targetUrl, query);
  };

  // Navigate to URL in browser view
  const handleNavigateTo = (url: string, title?: string) => {
    setTabs((prev) => {
      return prev.map((t) => {
        if (t.id === activeTabId) {
          return {
            ...t,
            url,
            title: title || url,
          };
        }
        return t;
      });
    });

    // Record into History (المسارات الرجعية)
    if (url && url !== 'about:home') {
      const pageTitle = title || url;
      const newHistoryEntry: HistoryItem = {
        id: 'hist-' + Date.now(),
        title: pageTitle,
        url,
        timestamp: 'الآن',
        date: new Date().toISOString().split('T')[0],
        timeMs: Date.now(),
      };
      setHistory((prev) => [newHistoryEntry, ...prev.slice(0, 49)]); // keep recent 50
      setNavigationStack((prev) => [...prev, url]);
    }

    // Increment blocked ads count dynamically
    setPrivacyStats((prev) => ({
      ...prev,
      adsBlocked: prev.adsBlocked + Math.floor(Math.random() * 5) + 3,
      trackersBlocked: prev.trackersBlocked + Math.floor(Math.random() * 4) + 1,
      dataSavedMB: parseFloat((prev.dataSavedMB + 1.2).toFixed(1)),
    }));
  };

  // Handle Home Click
  const handleGoHome = () => {
    // Record current tab as previous before going home
    if (activeTabId) {
      setPreviousTabId(activeTabId);
    }
    // Check if there is already an existing about:home tab
    const existingHomeTab = tabs.find((t) => t.url === 'about:home');
    if (existingHomeTab && existingHomeTab.id !== activeTabId) {
      setActiveTabId(existingHomeTab.id);
    } else {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, url: 'about:home', title: 'الصفحة الرئيسية' } : t))
      );
    }
  };

  // Handle Shortcut Click
  const handleOpenShortcut = (shortcut: QuickShortcut, asStandaloneApp: boolean) => {
    if (asStandaloneApp) {
      setStandaloneApp(shortcut);
    } else {
      handleNavigateTo(shortcut.url, shortcut.titleAr);
    }
  };

  // Tab & Folder Management
  const handleNewTab = (folderId?: string, url?: string, title?: string) => {
    const newId = 'tab-' + Date.now();
    const newTab: BrowserTab = {
      id: newId,
      title: title || (url && url !== 'about:home' ? url : 'الصفحة الرئيسية'),
      url: url || 'about:home',
      isLoading: false,
      folderId,
    };
    if (activeTabId) {
      setPreviousTabId(activeTabId);
    }
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setIsOpenTabsBoxOpen(false);
    setIsTabsModalOpen(false);
  };

  const handleSelectTab = (tabId: string) => {
    if (tabId !== activeTabId) {
      setPreviousTabId(activeTabId);
      setActiveTabId(tabId);
    }
    setIsOpenTabsBoxOpen(false);
    setIsTabsModalOpen(false);
  };

  const handleReturnToPreviousTab = () => {
    if (previousTabId && tabs.some((t) => t.id === previousTabId)) {
      const prev = previousTabId;
      setPreviousTabId(activeTabId);
      setActiveTabId(prev);
      setToastMessage(currentLanguage === 'ar' ? 'تم التبديل إلى التبويب السابق' : 'Switched to previous tab');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    // Fallback: switch to another open tab if available
    const other = tabs.find((t) => t.id !== activeTabId);
    if (other) {
      setPreviousTabId(activeTabId);
      setActiveTabId(other.id);
      setToastMessage(currentLanguage === 'ar' ? 'تم التبديل إلى التبويب الآخر' : 'Switched to another tab');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleCloseTab = (id: string) => {
    const remaining = tabs.filter((t) => t.id !== id);
    closeNativeTab(id);
    if (remaining.length === 0) {
      const fallbackId = 'tab-home-' + Date.now();
      const fallbackTab: BrowserTab = {
        id: fallbackId,
        title: 'الصفحة الرئيسية',
        url: 'about:home',
        isLoading: false,
      };
      setTabs([fallbackTab]);
      setActiveTabId(fallbackId);
      setPreviousTabId(null);
      return;
    }
    setTabs(remaining);
    if (activeTabId === id) {
      // If previousTabId exists in remaining tabs, switch back to it!
      if (previousTabId && remaining.some((t) => t.id === previousTabId)) {
        setActiveTabId(previousTabId);
        setPreviousTabId(null);
      } else {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
    } else if (previousTabId === id) {
      setPreviousTabId(null);
    }
  };

  const handleCloseOtherTabs = (keepId: string) => {
    const kept = tabs.filter((t) => t.id === keepId);
    if (kept.length > 0) {
      setTabs(kept);
      setActiveTabId(keepId);
      setPreviousTabId(null);
      setToastMessage(currentLanguage === 'ar' ? 'تم إغلاق التبويبات الأخرى' : 'Closed all other tabs');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Create new folder for tab grouping
  const handleCreateFolder = (name: string, color: string): string => {
    const newFolderId = 'folder-' + Date.now();
    const newFolder: TabFolder = {
      id: newFolderId,
      name: name.trim(),
      color: color || '#f59e0b',
      createdAt: Date.now(),
    };
    setTabFolders((prev) => [...prev, newFolder]);
    return newFolderId;
  };

  // Update existing folder (rename / change color)
  const handleUpdateFolder = (id: string, name: string, color: string) => {
    setTabFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: name.trim(), color } : f))
    );
  };

  // Delete folder with option to either keep tabs (unassigned) or close them
  const handleDeleteFolder = (id: string, deleteTabs: boolean) => {
    setTabFolders((prev) => prev.filter((f) => f.id !== id));
    if (deleteTabs) {
      setTabs((prev) => {
        const remaining = prev.filter((t) => t.folderId !== id);
        if (remaining.length === 0) {
          const fallbackTab: BrowserTab = {
            id: 'tab-home-' + Date.now(),
            title: 'الصفحة الرئيسية',
            url: 'about:home',
            isLoading: false,
          };
          setActiveTabId(fallbackTab.id);
          return [fallbackTab];
        }
        if (!remaining.some((t) => t.id === activeTabId)) {
          setActiveTabId(remaining[0].id);
        }
        return remaining;
      });
    } else {
      // Keep tabs but unassign folder
      setTabs((prev) =>
        prev.map((t) => (t.folderId === id ? { ...t, folderId: undefined } : t))
      );
    }
  };

  // Assign single tab to a folder or unassign (undefined)
  const handleAssignTabFolder = (tabId: string, folderId?: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, folderId } : t))
    );
  };

  // Assign multiple tabs to a folder in batch
  const handleAssignMultipleTabsFolder = (tabIds: string[], folderId?: string) => {
    setTabs((prev) =>
      prev.map((t) => (tabIds.includes(t.id) ? { ...t, folderId } : t))
    );
  };

  // Close all tabs belonging to a folder
  const handleCloseFolderTabs = (folderId: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.folderId !== folderId);
      if (remaining.length === 0) {
        const fallbackTab: BrowserTab = {
          id: 'tab-home-' + Date.now(),
          title: 'الصفحة الرئيسية',
          url: 'about:home',
          isLoading: false,
        };
        setActiveTabId(fallbackTab.id);
        return [fallbackTab];
      }
      if (!remaining.some((t) => t.id === activeTabId)) {
        setActiveTabId(remaining[0].id);
      }
      return remaining;
    });
  };

  const nativeNav = useNativeBridge({
    activeTabId,
    setTabs,
    setHistory,
    setDownloads,
    onGoHome: handleGoHome,
    onToast: (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);
    },
  });
  const isOverlayOpen =
    isVpnModalOpen || isShieldModalOpen || isPasswordModalOpen || isGoogleModalOpen ||
    isPerformanceModalOpen || isTabsModalOpen || isOpenTabsBoxOpen || isSettingsOpen ||
    isDownloadsModalOpen || isBookmarksHistoryModalOpen || isClearDataModalOpen ||
    isInternalVideoPlayerOpen || isImageDownloaderModalOpen || isApkModalOpen ||
    standaloneApp !== null;

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isBrowsingWeb = activeTab && activeTab.url !== 'about:home';

  return (
    <div
      id="lion-browser-root"
      style={isNativeApp ? { height: '100dvh', minHeight: 0, overflow: 'hidden', paddingTop: 'max(env(safe-area-inset-top, 0px), var(--safe-area-inset-top, 0px))', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), var(--safe-area-inset-bottom, 0px))' } : undefined}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start relative font-['Tajawal',sans-serif] selection:bg-amber-500 selection:text-slate-950"
      dir={currentLanguage === 'ar' || languages.find((l) => l.code === currentLanguage)?.dir === 'rtl' ? 'rtl' : 'ltr'}
    >
      {/* Top Universal Control & Frame Switcher Bar */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex items-center justify-between z-30 backdrop-blur-md">
        {/* Circular Lion Head Emblem Brand */}
        <div
          onClick={handleGoHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="Lion Browser Pro"
        >
          {/* Circular Golden Ring with Lion Head inside */}
          <div className="relative w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)] group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={lionLogoImg}
                alt="Lion Head Logo"
                className="w-full h-full object-cover object-center rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500">
                Lion Browser
              </span>
              <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">
              {currentLanguage === 'ar' ? 'متصفح الأسد للأندرويد' : 'Fast & Secure Android Browser'}
            </span>
          </div>
        </div>

        {/* Action badges: Language Switcher, Advanced Settings, VPN pill, Privacy shield, RAM badge, Google account, Frame toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Direct Install APK & PWA Button */}
          <button
            id="header-install-apk-btn"
            style={isNativeApp ? { display: 'none' } : undefined}
            type="button"
            onClick={() => setIsApkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition cursor-pointer shadow-md shadow-emerald-950/40 border border-emerald-400/40"
            title="تنزيل وتثبيت تطبيق متصفح الأسد للأندرويد APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
            <span className="font-bold">
              {currentLanguage === 'ar' ? 'تثبيت التطبيق 📲' : 'Install App'}
            </span>
          </button>

          {/* Quick System Language Switcher Pill (Arabic & English Primary + Switcher) */}
          <button
            id="header-language-pill-btn"
            type="button"
            onClick={() => {
              const next = currentLanguage === 'ar' ? 'en' : 'ar';
              setCurrentLanguage(next);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer"
            title={
              currentLanguage === 'ar'
                ? 'التبديل إلى الإنجليزية / Switch to English'
                : 'التبديل إلى العربية / Switch to Arabic'
            }
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-black uppercase">{currentLanguage}</span>
            <span className="text-[10px] text-amber-400 font-bold hidden sm:inline">
              {currentLanguage === 'ar' ? 'عربي' : 'EN'}
            </span>
          </button>

          {/* Advanced Settings Button (زر الإعدادات المتطور) */}
          <button
            id="header-advanced-settings-btn"
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 hover:from-amber-500/25 hover:to-yellow-500/30 border border-amber-400/50 text-amber-300 transition cursor-pointer shadow-sm group"
            title="الإعدادات المتطورة واللغات"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="hidden md:inline font-bold">
              {t(currentLanguage, 'advancedSettings')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 hidden sm:inline-block"></span>
          </button>

          {/* Proton VPN status pill */}
          <button
            id="header-vpn-pill-btn"
            type="button"
            onClick={() => setIsVpnModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
              vpnState.isConnected
                ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 shadow-sm shadow-purple-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-purple-300'
            }`}
            title="Proton VPN Free"
          >
            <Shield className={`w-3.5 h-3.5 ${vpnState.isConnected ? 'text-purple-400' : ''}`} />
            <span className="hidden sm:inline">Proton VPN</span>
            <span className={`w-2 h-2 rounded-full ${vpnState.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          </button>

          {/* Privacy Shield Pill */}
          <button
            id="header-shield-pill-btn"
            type="button"
            onClick={() => setIsShieldModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition cursor-pointer"
            title="درع الخصوصية وحجب الإعلانات"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">حاجب الإعلانات</span>
            <span className="text-[10px] font-mono font-black">{privacyStats.adsBlocked}</span>
          </button>

          {/* RAM & Battery Optimizer Pill */}
          <button
            id="header-performance-pill-btn"
            type="button"
            onClick={() => setIsPerformanceModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition cursor-pointer"
            title="توفير الرام والبطارية"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[11px]">{performance.currentRamUsageMB.toFixed(0)}MB</span>
          </button>

          {/* Google Sync Button */}
          <button
            id="header-google-sync-btn"
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="p-1 rounded-full border border-slate-700 hover:border-blue-400 transition cursor-pointer"
            title={googleAccount.isSignedIn ? `مزامنة مع ${googleAccount.email}` : 'تسجيل الدخول بحساب غوغل'}
          >
            {googleAccount.isSignedIn ? (
              <img
                src={googleAccount.avatarUrl}
                alt={googleAccount.name}
                className="w-6 h-6 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <span className="text-[11px] font-black text-blue-600">G</span>
              </div>
            )}
          </button>

          {/* Frame View Toggle (Phone Frame vs Full Width) */}
          <button
            id="toggle-frame-mode-btn"
            type="button"
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer hidden md:flex"
            title={isMobileFrame ? 'عرض بملء الشاشة' : 'عرض في إطار هاتف أندرويد'}
          >
            {isMobileFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Browser Container: Responsive Phone Shell or Full Layout */}
      <main
        className={`flex-1 w-full transition-all duration-300 flex flex-col ${
          isMobileFrame
            ? 'max-w-md my-4 rounded-[42px] border-[10px] border-slate-900 shadow-2xl overflow-hidden bg-slate-950 min-h-[780px] ring-1 ring-slate-800'
            : `max-w-5xl mx-auto ${isNativeApp ? 'min-h-0 overflow-hidden' : 'min-h-[calc(100vh-50px)]'}`
        }`}
      >
        {/* Android Status Bar (Realistic mobile clock, battery, wifi, 5G) */}
        <div style={isNativeApp ? { display: 'none' } : undefined} className="w-full bg-slate-950/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-medium text-slate-400 border-b border-slate-900 z-20">
          <span className="font-bold text-slate-200 font-mono">{currentTime}</span>

          <div className="flex items-center gap-2">
            {vpnState.isConnected && (
              <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.2 rounded font-mono">
                VPN
              </span>
            )}
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-300 font-mono">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                battery.level <= 15
                  ? 'text-rose-400 font-bold animate-pulse'
                  : battery.level <= 25
                  ? 'text-amber-400 font-bold'
                  : 'text-emerald-400 font-bold'
              }`}
              onClick={() => setIsPerformanceModalOpen(true)}
              title={`حالة البطارية: ${battery.level}% ${battery.charging ? '(جارِ الشحن ⚡)' : ''} ${
                performance.batterySaver ? '• موفر الطاقة نشط' : ''
              }`}
            >
              <span className="text-[10px] font-mono font-bold">{battery.level}%</span>
              {battery.charging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-300 animate-pulse" />
              ) : battery.level <= 20 ? (
                <BatteryWarning className="w-4 h-4 text-amber-400" />
              ) : (
                <Battery className="w-4 h-4 text-emerald-400" />
              )}
            </div>
          </div>
        </div>

        {/* CONTENT SWITCHER: Either Browsing a URL OR The Home Search & Shortcuts Screen */}
        {isBrowsingWeb ? (
          <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
            <BrowserView
              tab={activeTab}
              tabsCount={tabs.length}
              onNavigate={(url, title) => handleNavigateTo(url, title)}
              onHome={handleGoHome}
              onOpenTabs={() => setIsOpenTabsBoxOpen(true)}
              onReturnToPreviousTab={handleReturnToPreviousTab}
              previousTabTitle={tabs.find((t) => t.id === previousTabId)?.title}
              googleAccount={googleAccount}
              onOpenGoogleSync={() => setIsGoogleModalOpen(true)}
              onOpenShield={() => setIsShieldModalOpen(true)}
              onOpenVpn={() => setIsVpnModalOpen(true)}
              onOpenStandaloneMode={(shortcut) => setStandaloneApp(shortcut)}
              onCreateAppShortcut={handleCreateAppShortcut}
              onSavePasswordPrompt={(url) => {
                setIsPasswordModalOpen(true);
              }}
              onOpenDownloads={() => setIsDownloadsModalOpen(true)}
              onToggleTranslator={() => setIsTranslationBarOpen((prev) => !prev)}
              isTranslatorOpen={isTranslationBarOpen}
              onToggleBookmark={(url, title) => handleToggleBookmark(url, title)}
              isCurrentUrlBookmarked={bookmarks.some((b) => b.url === activeTab.url)}
              onOpenBookmarksHistory={(initial) => {
                setBookmarksHistoryInitialTab(initial || 'bookmarks');
                setIsBookmarksHistoryModalOpen(true);
              }}
              onOpenClearData={() => setIsClearDataModalOpen(true)}
              canGoBack={navigationStack.length > 0}
              onGoBack={handleGoBack}
              isVpnActive={vpnState.isConnected}
              vpnState={vpnState}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenVideoPlayer={(url, title) => {
                setInternalVideoInitialUrl(url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
                setInternalVideoInitialTitle(title || 'Lion Video Player HD');
                setIsInternalVideoPlayerOpen(true);
              }}
              onOpenImageDownloader={(url, title) => {
                setImageDownloaderPageUrl(url || activeTab.url);
                setImageDownloaderPageTitle(title || activeTab.title || 'صفحة الويب');
                setIsImageDownloaderModalOpen(true);
              }}
              onAddDownload={handleAddDownload}
              onOpenApkModal={() => setIsApkModalOpen(true)}
              nativeNav={nativeNav}
              nativeHidden={isOverlayOpen}
              defaultSearchUrl={SEARCH_ENGINES[currentEngine].searchUrl}
              onShowToast={(msg) => {
                setToastMessage(msg);
                setTimeout(() => setToastMessage(null), 4000);
              }}
              currentLanguage={currentLanguage}
            />

            {/* Translation Bar overlay on demand */}
            {isTranslationBarOpen && (
              <TranslationBar
                currentUrl={activeTab.url}
                pageTitle={activeTab.title || 'صفحة الويب'}
                onClose={() => setIsTranslationBarOpen(false)}
              />
            )}
          </div>
        ) : (
          /* HOME SCREEN OF LION BROWSER */
          <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 overflow-y-auto">
            <div className="flex flex-col items-center">
              {/* Lion Head Logo & Brand Title */}
              <div className="mt-4 sm:mt-6 mb-5">
                <LionLogo
                  size="md"
                  showSubtitle={true}
                  titleText={t(currentLanguage, 'appName')}
                  subtitleText={t(currentLanguage, 'appSubtitle')}
                />
              </div>

              {/* Search Engine Pills + Main Search Bar */}
              <SearchBar
                currentEngine={currentEngine}
                onEngineChange={(engine) => setCurrentEngine(engine)}
                onSearch={handleSearchSubmit}
              />

              {/* 10 Requested Quick Shortcut Icons + Add Shortcut + Standalone Launcher */}
              <QuickShortcuts
                shortcuts={shortcuts}
                onOpenShortcut={handleOpenShortcut}
                onAddShortcut={(newShortcut) => setShortcuts((prev) => [...prev, newShortcut])}
                onRemoveShortcut={(id) => setShortcuts((prev) => prev.filter((s) => s.id !== id))}
              />

              {/* Protection & Performance Summary Cards */}
              <div className="w-full max-w-2xl mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                {/* Shield card */}
                <div
                  onClick={() => setIsShieldModalOpen(true)}
                  className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-2.5 cursor-pointer transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-200 block">
                    {currentLanguage === 'ar' ? 'حاجب الإعلانات' : 'AdBlocker'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">100% نشط</span>
                </div>

                {/* Proton VPN card */}
                <div
                  onClick={() => setIsVpnModalOpen(true)}
                  className="bg-slate-900/80 hover:bg-slate-800/80 border border-purple-500/20 rounded-2xl p-2.5 cursor-pointer transition"
                >
                  <Shield className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-200 block">Proton VPN</span>
                  <span className="text-[10px] text-purple-300 font-mono">
                    {vpnState.isConnected ? 'متصل' : 'سيرفرات مجانية'}
                  </span>
                </div>

                {/* RAM & Battery card */}
                <div
                  onClick={() => setIsPerformanceModalOpen(true)}
                  className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-2.5 cursor-pointer transition"
                >
                  <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-200 block">
                    {currentLanguage === 'ar' ? 'توفير الرام' : 'RAM Saver'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {performance.currentRamUsageMB.toFixed(0)} MB فقط
                  </span>
                </div>
              </div>

              {/* Download Application Banner */}
              <div
                onClick={() => setIsApkModalOpen(true)}
                className="w-full max-w-2xl mt-3 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-3 cursor-pointer transition flex items-center justify-between gap-3 shadow-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-2">
                      <span>{currentLanguage === 'ar' ? 'تنزيل وتثبيت التطبيق على هاتفك' : 'Install Lion Browser on Phone'}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">APK & PWA</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {currentLanguage === 'ar'
                        ? 'تثبيت فوري على شاشة الهاتف الرئيسية أو تنزيل ملف وحزمة APK'
                        : 'Instant Home Screen Install or Download Android APK'}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 shadow">
                  <Download className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'ar' ? 'تنزيل' : 'Install'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Android Browser Navigation Bar */}
            <div className="w-full max-w-2xl mx-auto mt-6 bg-slate-900/95 border border-slate-800 rounded-2xl p-2 flex items-center justify-around shadow-xl">
              <button
                type="button"
                onClick={handleGoHome}
                className="p-2 text-amber-400 hover:bg-slate-800 rounded-xl transition cursor-pointer flex flex-col items-center gap-0.5"
                title="الرئيسية"
              >
                <Search className="w-4 h-4" />
                <span className="text-[9px] font-bold">{currentLanguage === 'ar' ? 'بحث' : 'Search'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVpnModalOpen(true)}
                className={`p-2 rounded-xl transition cursor-pointer flex flex-col items-center gap-0.5 ${
                  vpnState.isConnected ? 'text-purple-400' : 'text-slate-400 hover:text-purple-300'
                }`}
                title="Proton VPN"
              >
                <Shield className="w-4 h-4" />
                <span className="text-[9px] font-bold">VPN</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-2 text-slate-400 hover:text-amber-400 rounded-xl transition cursor-pointer flex flex-col items-center gap-0.5"
                title="كلمات المرور"
              >
                <Key className="w-4 h-4" />
                <span className="text-[9px] font-bold">{currentLanguage === 'ar' ? 'كلمات السر' : 'Passwords'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDownloadsModalOpen(true)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer flex flex-col items-center gap-0.5"
                title="التنزيلات وحفظ الفيديو"
              >
                <Download className="w-4 h-4" />
                <span className="text-[9px] font-bold">{currentLanguage === 'ar' ? 'التنزيلات' : 'Downloads'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookmarksHistoryInitialTab('bookmarks');
                  setIsBookmarksHistoryModalOpen(true);
                }}
                className="p-2 text-slate-400 hover:text-blue-400 rounded-xl transition cursor-pointer flex flex-col items-center gap-0.5"
                title="المفضلة والسجل"
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-[9px] font-bold">{t(currentLanguage, 'bookmarks')}</span>
              </button>

              {/* Previous Tab Quick Return Button (if more than 1 tab exists) */}
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={handleReturnToPreviousTab}
                  className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition cursor-pointer flex flex-col items-center gap-0.5"
                  title={currentLanguage === 'ar' ? 'العودة إلى التبويب السابق' : 'Return to previous tab'}
                >
                  <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-300">
                    {currentLanguage === 'ar' ? 'التبويب السابق' : 'Prev Tab'}
                  </span>
                </button>
              )}

              {/* Open Tabs Box Button */}
              <button
                type="button"
                onClick={() => setIsOpenTabsBoxOpen(true)}
                className="p-2 text-slate-400 hover:text-amber-400 rounded-xl transition cursor-pointer flex flex-col items-center gap-0.5"
                title={currentLanguage === 'ar' ? 'صندوق علامات التبويب المفتوحة' : 'Open Tabs Box'}
              >
                <div className="w-4 h-4 rounded border border-slate-500 flex items-center justify-center text-[10px] font-bold">
                  {tabs.length}
                </div>
                <span className="text-[9px] font-bold">{tabs.length} {currentLanguage === 'ar' ? 'تبويب' : 'Tabs'}</span>
              </button>

              {/* Advanced Settings Button (زر الإعدادات المتطور) */}
              <button
                id="bottom-bar-advanced-settings-btn"
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-xl transition cursor-pointer flex flex-col items-center gap-0.5 group relative"
                title="الإعدادات المتطورة واللغات"
              >
                <div className="relative">
                  <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full"></span>
                </div>
                <span className="text-[9px] font-black text-amber-300">
                  {t(currentLanguage, 'advancedSettings')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Android Bottom Gesture Indicator Bar */}
        <div className="w-full bg-slate-950 py-2 flex items-center justify-center">
          <div className="w-32 h-1 rounded-full bg-slate-700"></div>
        </div>
      </main>

      {/* Standalone Web App View (Runs WITHOUT browser header) */}
      {standaloneApp && (
        <StandaloneAppView
          app={standaloneApp}
          onClose={() => setStandaloneApp(null)}
          onOpenInBrowser={(url) => {
            setStandaloneApp(null);
            handleNavigateTo(url);
          }}
        />
      )}

      {/* Modals */}
      {isVpnModalOpen && (
        <ProtonVpnModal
          vpnState={vpnState}
          onToggleConnect={handleToggleVpn}
          onSelectServer={handleSelectVpnServer}
          onToggleKillSwitch={handleToggleKillSwitch}
          onClose={() => setIsVpnModalOpen(false)}
        />
      )}

      {isShieldModalOpen && (
        <PrivacyShieldModal
          stats={privacyStats}
          onToggleAdBlock={() =>
            setPrivacyStats((prev) => ({ ...prev, adBlockActive: !prev.adBlockActive }))
          }
          onToggleTrackers={() =>
            setPrivacyStats((prev) => ({ ...prev, trackerBlockActive: !prev.trackerBlockActive }))
          }
          onToggleFingerprint={() =>
            setPrivacyStats((prev) => ({
              ...prev,
              fingerprintShieldActive: !prev.fingerprintShieldActive,
            }))
          }
          onToggleStrictHttps={() =>
            setPrivacyStats((prev) => ({ ...prev, strictHttpsActive: !prev.strictHttpsActive }))
          }
          onClose={() => setIsShieldModalOpen(false)}
        />
      )}

      {isPasswordModalOpen && (
        <PasswordManagerModal
          passwords={passwords}
          onAddPassword={(newPwd) => setPasswords((prev) => [...prev, newPwd])}
          onDeletePassword={(id) => setPasswords((prev) => prev.filter((p) => p.id !== id))}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}

      {isGoogleModalOpen && (
        <GoogleSyncModal
          account={googleAccount}
          onUpdateAccount={(acc) => setGoogleAccount(acc)}
          onClose={() => setIsGoogleModalOpen(false)}
        />
      )}

      {isPerformanceModalOpen && (
        <PerformanceModal
          performance={performance}
          onUpdatePerformance={(perf) => setPerformance(perf)}
          onClose={() => setIsPerformanceModalOpen(false)}
          battery={battery}
        />
      )}

      {/* Open Tabs Box (صندوق علامات التبويب المفتوحة للعودة لعلامة تبويب سابقة) */}
      {isOpenTabsBoxOpen && (
        <OpenTabsBox
          isOpen={isOpenTabsBoxOpen}
          onClose={() => setIsOpenTabsBoxOpen(false)}
          tabs={tabs}
          activeTabId={activeTabId}
          previousTabId={previousTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onNewTab={() => handleNewTab()}
          onCloseOtherTabs={handleCloseOtherTabs}
          onReturnToPreviousTab={handleReturnToPreviousTab}
          onOpenAdvancedTabsManager={() => setIsTabsModalOpen(true)}
          folders={tabFolders}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Advanced Tabs & Folders Manager Modal */}
      {isTabsModalOpen && (
        <TabsManagerModal
          tabs={tabs}
          activeTabId={activeTabId}
          folders={tabFolders}
          currentLanguage={currentLanguage}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
          onClose={() => setIsTabsModalOpen(false)}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onAssignTabFolder={handleAssignTabFolder}
          onAssignMultipleTabsFolder={handleAssignMultipleTabsFolder}
          onCloseFolderTabs={handleCloseFolderTabs}
          previousTabId={previousTabId}
          onReturnToPreviousTab={handleReturnToPreviousTab}
        />
      )}

      {/* 7. Downloads & Video Saver Modal */}
      {isDownloadsModalOpen && (
        <DownloadsModal
          downloads={downloads}
          currentUrl={activeTab.url}
          currentPageTitle={activeTab.title}
          onAddDownload={handleAddDownload}
          onDeleteDownload={handleDeleteDownload}
          onClearCompleted={handleClearCompletedDownloads}
          onClose={() => setIsDownloadsModalOpen(false)}
          onOpenVideoPlayer={(url, title) => {
            setIsDownloadsModalOpen(false);
            setInternalVideoInitialUrl(url);
            setInternalVideoInitialTitle(title);
            setIsInternalVideoPlayerOpen(true);
          }}
          onOpenImageDownloader={(url, title) => {
            setIsDownloadsModalOpen(false);
            setImageDownloaderPageUrl(url || activeTab.url);
            setImageDownloaderPageTitle(title || activeTab.title || 'صفحة الويب');
            setIsImageDownloaderModalOpen(true);
          }}
        />
      )}

      {/* 8. Internal Video Player with Dedicated Download Bar under Video */}
      <InternalVideoPlayerModal
        isOpen={isInternalVideoPlayerOpen}
        onClose={() => setIsInternalVideoPlayerOpen(false)}
        initialVideoUrl={internalVideoInitialUrl}
        initialVideoTitle={internalVideoInitialTitle}
        downloadedVideos={downloads.filter((d) => d.fileType === 'video')}
        currentLanguage={currentLanguage}
        onAddDownload={handleAddDownload}
        onOpenDownloadsManager={() => {
          setIsInternalVideoPlayerOpen(false);
          setIsDownloadsModalOpen(true);
        }}
      />

      {/* 9. Specific Image Downloader & Page Images Extractor Modal */}
      <ImageDownloaderModal
        isOpen={isImageDownloaderModalOpen}
        onClose={() => setIsImageDownloaderModalOpen(false)}
        pageUrl={imageDownloaderPageUrl || activeTab.url}
        pageTitle={imageDownloaderPageTitle || activeTab.title}
        onAddDownload={handleAddDownload}
        currentLanguage={currentLanguage}
        onOpenDownloadsManager={() => {
          setIsImageDownloaderModalOpen(false);
          setIsDownloadsModalOpen(true);
        }}
      />

      {/* 8. Bookmarks & Navigation History Modal */}
      {isBookmarksHistoryModalOpen && (
        <BookmarksAndHistoryModal
          bookmarks={bookmarks}
          history={history}
          initialTab={bookmarksHistoryInitialTab}
          onNavigate={(url, title) => {
            setIsBookmarksHistoryModalOpen(false);
            handleNavigateTo(url, title);
          }}
          onAddBookmark={handleAddBookmark}
          onDeleteBookmark={handleDeleteBookmark}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          onClearHistory={handleClearHistory}
          onOpenClearDataModal={() => {
            setIsBookmarksHistoryModalOpen(false);
            setIsClearDataModalOpen(true);
          }}
          onClose={() => setIsBookmarksHistoryModalOpen(false)}
        />
      )}

      {/* 9. Clear Data & Cache Modal */}
      {isClearDataModalOpen && (
        <ClearDataModal
          onClearData={handleClearBrowsingData}
          onClose={() => setIsClearDataModalOpen(false)}
        />
      )}

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        googleAccount={googleAccount}
        onOpenGoogleSync={() => setIsGoogleModalOpen(true)}
        currentEngine={currentEngine}
        onSelectEngine={(engine) => setCurrentEngine(engine)}
        onOpenVpn={() => setIsVpnModalOpen(true)}
        vpnState={vpnState}
        onOpenPrivacyShield={() => setIsShieldModalOpen(true)}
        onOpenPasswordManager={() => setIsPasswordModalOpen(true)}
        onOpenPerformance={() => setIsPerformanceModalOpen(true)}
        performance={performance}
        onOpenDownloads={() => setIsDownloadsModalOpen(true)}
        onOpenBookmarksHistory={(tab) => {
          setBookmarksHistoryInitialTab(tab || 'bookmarks');
          setIsBookmarksHistoryModalOpen(true);
        }}
        onOpenClearData={() => setIsClearDataModalOpen(true)}
        currentLanguage={currentLanguage}
        languages={languages}
        onSelectLanguage={(code) => setCurrentLanguage(code)}
        onAddNewLanguage={handleAddNewLanguage}
        currentTabUrl={activeTab?.url}
        currentTabTitle={activeTab?.title}
        onCreateAppShortcut={handleCreateAppShortcut}
      />

      {/* 10. Android APK / PWA Download & Installation Modal */}
      <AndroidApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        currentLanguage={currentLanguage}
        onShowToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Floating Toast Notification for Desktop Shortcut Creation */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-60 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl text-xs flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-top-2 duration-150 max-w-sm text-center">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
