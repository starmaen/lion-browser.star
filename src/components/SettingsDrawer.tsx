import React, { useState } from 'react';
import {
  X,
  Shield,
  Key,
  Globe,
  Zap,
  Battery,
  UserCheck,
  Search,
  ExternalLink,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Download,
  Bookmark,
  History,
  Flame,
  Languages,
  Plus,
  Check,
  Cpu,
  Settings,
  SlidersHorizontal,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import {
  GoogleAccount,
  SearchEngineId,
  PerformanceSettings,
  PrivacyStats,
  VpnState,
  AppLanguage,
} from '../types';
import { SEARCH_ENGINES } from '../data/initialData';
import { t } from '../data/translations';
import { LionLogo } from './LionLogo';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  googleAccount: GoogleAccount;
  onOpenGoogleSync: () => void;
  currentEngine: SearchEngineId;
  onSelectEngine: (engine: SearchEngineId) => void;
  onOpenVpn: () => void;
  vpnState: VpnState;
  onOpenPrivacyShield: () => void;
  onOpenPasswordManager: () => void;
  onOpenPerformance: () => void;
  performance: PerformanceSettings;
  onOpenDownloads: () => void;
  onOpenBookmarksHistory: (tab?: 'bookmarks' | 'history') => void;
  onOpenClearData: () => void;
  currentLanguage: string;
  languages: AppLanguage[];
  onSelectLanguage: (code: string) => void;
  onAddNewLanguage: (lang: AppLanguage) => void;
  currentTabUrl?: string;
  currentTabTitle?: string;
  onCreateAppShortcut?: (url: string, title: string) => void;
}

// Predefined extra languages for quick 1-click addition
const PREDEFINED_EXTRA_LANGUAGES: AppLanguage[] = [
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', flag: '🇰🇷' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  googleAccount,
  onOpenGoogleSync,
  currentEngine,
  onSelectEngine,
  onOpenVpn,
  vpnState,
  onOpenPrivacyShield,
  onOpenPasswordManager,
  onOpenPerformance,
  performance,
  onOpenDownloads,
  onOpenBookmarksHistory,
  onOpenClearData,
  currentLanguage,
  languages,
  onSelectLanguage,
  onAddNewLanguage,
  currentTabUrl,
  currentTabTitle,
  onCreateAppShortcut,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'language' | 'search' | 'privacy' | 'performance' | 'tools'
  >('all');
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [customLangName, setCustomLangName] = useState('');
  const [customLangCode, setCustomLangCode] = useState('');
  const [customLangDir, setCustomLangDir] = useState<'rtl' | 'ltr'>('ltr');
  const [customLangFlag, setCustomLangFlag] = useState('🌐');

  if (!isOpen) return null;

  const isRtl = currentLanguage === 'ar' || languages.find((l) => l.code === currentLanguage)?.dir === 'rtl';

  const handleCreateCustomLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLangCode.trim() || !customLangName.trim()) return;

    const newLang: AppLanguage = {
      code: customLangCode.trim().toLowerCase(),
      name: customLangName.trim(),
      nativeName: customLangName.trim(),
      dir: customLangDir,
      flag: customLangFlag || '🌐',
      isCustom: true,
    };

    onAddNewLanguage(newLang);
    onSelectLanguage(newLang.code);
    setShowAddLanguageModal(false);
    setCustomLangCode('');
    setCustomLangName('');
  };

  const handleAddPredefined = (predefined: AppLanguage) => {
    onAddNewLanguage(predefined);
    onSelectLanguage(predefined.code);
    setShowAddLanguageModal(false);
  };

  // Filter available predefined languages not yet added
  const remainingPredefined = PREDEFINED_EXTRA_LANGUAGES.filter(
    (p) => !languages.some((l) => l.code === p.code)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/80 backdrop-blur-md p-0 sm:p-4">
      <div
        id="settings-drawer-panel"
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-slate-900 border border-slate-800 w-full sm:max-w-xl h-full sm:h-[95vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Header with Circular Lion Emblem */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LionLogo size="xs" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  {t(currentLanguage, 'settingsTitle')}
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                  Android Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t(currentLanguage, 'appSubtitle')}
              </p>
            </div>
          </div>
          <button
            id="settings-close-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters Bar */}
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: isRtl ? 'كافة الإعدادات' : 'All Settings', icon: SlidersHorizontal },
            { id: 'language', label: isRtl ? 'اللغة والواجهة' : 'Languages', icon: Languages },
            { id: 'privacy', label: isRtl ? 'الأمان وVPN' : 'Security & VPN', icon: Shield },
            { id: 'search', label: isRtl ? 'محرك البحث' : 'Search Engine', icon: Search },
            { id: 'performance', label: isRtl ? 'السرعة وRAM' : 'Turbo & RAM', icon: Zap },
            { id: 'tools', label: isRtl ? 'التنزيلات والسجل' : 'Downloads & Tools', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SECTION 1: SYSTEM LANGUAGE (العربية والانكليزية واضافة لغات) */}
          {(activeCategory === 'all' || activeCategory === 'language') && (
            <div
              id="settings-languages-card"
              className="bg-slate-950 p-4 rounded-2xl border-2 border-amber-500/40 relative overflow-hidden shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{t(currentLanguage, 'systemLanguage')}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                        {isRtl ? 'الأساسية: العربية والإنجليزية' : 'Primary: Arabic & English'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isRtl
                        ? 'تغيير لغة المتصفح والاتجاه وإضافة لغات عالمية جديدة'
                        : 'Change browser UI language, text direction, or add new languages'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="add-language-btn"
                  onClick={() => setShowAddLanguageModal(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl hover:from-amber-400 hover:to-yellow-400 shadow-md transition cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t(currentLanguage, 'addLanguage')}</span>
                </button>
              </div>

              {/* Languages Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {languages.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  const isPrimary = lang.code === 'ar' || lang.code === 'en';
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => onSelectLanguage(lang.code)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer text-left ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{lang.flag}</span>
                        <div className="truncate">
                          <span className="text-xs font-black block truncate">
                            {lang.nativeName}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {lang.name} {isPrimary && '★'}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick info note */}
              <div className="mt-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {isRtl
                    ? 'اللغة النشطة حالياً: '
                    : 'Currently Active: '}
                  <strong className="text-amber-400">
                    {languages.find((l) => l.code === currentLanguage)?.nativeName || currentLanguage}
                  </strong>
                </span>
                <span className="text-[10px] text-slate-500">
                  {isRtl ? 'دعم اتجاه RTL / LTR تلقائياً' : 'Auto RTL/LTR support'}
                </span>
              </div>
            </div>
          )}

          {/* SECTION 2: GOOGLE ACCOUNT SYNC */}
          {(activeCategory === 'all' || activeCategory === 'privacy') && (
            <div
              id="settings-google-account-section"
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative group overflow-hidden cursor-pointer hover:border-blue-500/40 transition"
              onClick={() => {
                onClose();
                onOpenGoogleSync();
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-100">
                        {googleAccount.isSignedIn
                          ? googleAccount.name
                          : isRtl
                          ? 'تسجيل الدخول ومزامنة Google'
                          : 'Sign In & Google Sync'}
                      </span>
                      {googleAccount.isSignedIn && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                          {isRtl ? 'نشط ومزامن' : 'Synced'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {googleAccount.isSignedIn
                        ? googleAccount.email
                        : isRtl
                        ? 'مزامنة كلمات المرور، المفضلات، والتبويبات سحابياً'
                        : 'Sync passwords, bookmarks, and tabs securely'}
                    </span>
                  </div>
                </div>
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: SEARCH ENGINE */}
          {(activeCategory === 'all' || activeCategory === 'search') && (
            <div
              id="settings-search-engine-card"
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-black text-slate-100">
                    {t(currentLanguage, 'searchEngines')}
                  </h3>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">
                  {SEARCH_ENGINES[currentEngine]?.name}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SEARCH_ENGINES).map((engine) => {
                  const isSelected = currentEngine === engine.id;
                  return (
                    <button
                      key={engine.id}
                      onClick={() => onSelectEngine(engine.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${engine.iconColor}`}></span>
                        <span className="text-xs font-bold">
                          {isRtl ? engine.nameAr : engine.name}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: PRIVACY SHIELD & PROTON VPN */}
          {(activeCategory === 'all' || activeCategory === 'privacy') && (
            <>
              {/* Privacy Shield */}
              <div
                id="settings-privacy-shield-card"
                onClick={() => {
                  onClose();
                  onOpenPrivacyShield();
                }}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-100 block">
                      {t(currentLanguage, 'privacyShield')}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {isRtl
                        ? 'حجب الإعلانات المزعجة، تعقب المواقع، والترقية الإلزامية لـ HTTPS'
                        : 'Block intrusive ads, trackers, and enforce HTTPS'}
                    </span>
                  </div>
                </div>
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                )}
              </div>

              {/* Proton VPN */}
              <div
                id="settings-vpn-card"
                onClick={() => {
                  onClose();
                  onOpenVpn();
                }}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      vpnState.isConnected
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-100">
                        {t(currentLanguage, 'vpnTunnel')}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                          vpnState.isConnected
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {vpnState.isConnected
                          ? isRtl
                            ? 'مشفر ونشط'
                            : 'Connected'
                          : isRtl
                          ? 'معطل'
                          : 'Disconnected'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {vpnState.isConnected
                        ? `${vpnState.activeServer.countryAr} (${vpnState.activeServer.ip})`
                        : isRtl
                        ? 'تشفير عسكري من سويسرا وحماية عنوان IP'
                        : 'Swiss military encryption & IP protection'}
                    </span>
                  </div>
                </div>
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </>
          )}

          {/* SECTION 5: PERFORMANCE RAM TURBO */}
          {(activeCategory === 'all' || activeCategory === 'performance') && (
            <div
              id="settings-ram-turbo-card"
              onClick={() => {
                onClose();
                onOpenPerformance();
              }}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-100 block">
                    {t(currentLanguage, 'ramTurbo')}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {isRtl
                      ? `استهلاك RAM: ${performance.currentRamUsageMB.toFixed(1)}MB • تم توفير ${performance.ramSavedMB.toFixed(0)}MB`
                      : `RAM Usage: ${performance.currentRamUsageMB.toFixed(1)}MB • Saved ${performance.ramSavedMB.toFixed(0)}MB`}
                  </span>
                </div>
              </div>
              {isRtl ? (
                <ChevronLeft className="w-4 h-4 text-amber-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-amber-400" />
              )}
            </div>
          )}

          {/* SECTION 6: DOWNLOADS & TOOLS */}
          {(activeCategory === 'all' || activeCategory === 'tools') && (
            <>
              {/* Downloads & Video Saver */}
              <div
                id="settings-downloads-card"
                onClick={() => {
                  onClose();
                  onOpenDownloads();
                }}
                className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 hover:border-rose-500/50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-100 block">
                      {t(currentLanguage, 'downloadsAndVideos')}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {isRtl
                        ? 'تنزيل مقاطع الفيديو بجودة 1080p وحفظ المستندات وملفات APK'
                        : 'Download 1080p videos, documents, and APK files'}
                    </span>
                  </div>
                </div>
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4 text-rose-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                )}
              </div>

              {/* Bookmarks & History */}
              <div
                id="settings-bookmarks-history-card"
                onClick={() => {
                  onClose();
                  onOpenBookmarksHistory('bookmarks');
                }}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-100 block">
                      {t(currentLanguage, 'bookmarksAndHistory')}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {isRtl
                        ? 'إدارة المفضلات، المسارات الرجعية، والبحث في سجل التصفح'
                        : 'Manage bookmarks, backward navigation trails, and history'}
                    </span>
                  </div>
                </div>
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                )}
              </div>

              {/* Password Manager */}
              <div
                id="settings-password-manager-card"
                onClick={() => {
                  onClose();
                  onOpenPasswordManager();
                }}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-100 block">
                      {t(currentLanguage, 'passwordManager')}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {isRtl
                        ? 'حفظ كلمات المرور وتوليد كلمات سر قوية مشفرة'
                        : 'Encrypted credentials vault & strong password generator'}
                    </span>
                  </div>
                </div>
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                )}
              </div>

              {/* Create App Shortcut on Desktop Card */}
              <div
                id="settings-create-desktop-shortcut-card"
                onClick={() => {
                  onClose();
                  if (onCreateAppShortcut) {
                    const targetUrl = currentTabUrl && currentTabUrl !== 'about:home' ? currentTabUrl : 'https://www.google.com';
                    const targetTitle = currentTabTitle && currentTabTitle !== 'الصفحة الرئيسية' ? currentTabTitle : 'تطبيق ويب';
                    onCreateAppShortcut(targetUrl, targetTitle);
                  }
                }}
                className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 hover:border-amber-500 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-300 block">
                      {isRtl ? 'إنشاء اختصار تطبيق على سطح المكتب' : 'Create App Shortcut on Desktop'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {currentTabUrl && currentTabUrl !== 'about:home'
                        ? isRtl
                          ? `إنشاء اختصار مباشر لـ: ${currentTabTitle || currentTabUrl}`
                          : `Create direct desktop shortcut for: ${currentTabTitle || currentTabUrl}`
                        : isRtl
                        ? 'تثبيت أي موقع كأيقونة تطبيق مستقل على سطح المكتب والشاشة الرئيسية'
                        : 'Install any open web page as a desktop/home app icon'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold">
                    {isRtl ? 'تطبيق مستقل' : 'PWA'}
                  </span>
                  {isRtl ? (
                    <ChevronLeft className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              </div>

              {/* Clear Data & Deep Cache Cleaning */}
              <div
                id="settings-clear-data-card"
                onClick={() => {
                  onClose();
                  onOpenClearData();
                }}
                className="bg-slate-950 p-4 rounded-2xl border border-rose-950 hover:border-rose-500/40 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-600/30 flex items-center justify-center text-rose-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-100 block">
                      {t(currentLanguage, 'clearBrowsingData')}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {isRtl
                        ? 'حذف الكوكيز، تفريغ ذاكرة الكاش، وإزالة سجل البحث بضغطة واحدة'
                        : 'Purge cookies, clear cache memory, and delete traces'}
                    </span>
                  </div>
                </div>
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4 text-rose-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                )}
              </div>
            </>
          )}

          {/* ABOUT LION BROWSER BRAND CARD */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <div className="flex justify-center mb-2">
              <LionLogo size="xs" showSubtitle={false} />
            </div>
            <h4 className="text-xs font-black text-slate-200">Lion Browser Pro for Android</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Engine: LionWebKit Quantum 2026.9 • Chromium Core 132 • Built for Privacy & Speed
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-bold">Lion Browser v3.4 Pro</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      {/* POPUP MODAL: ADD NEW LANGUAGE */}
      {showAddLanguageModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl p-5 overflow-hidden text-right"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isRtl ? 'إضافة لغة جديدة للنظام' : 'Add New System Language'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {isRtl ? 'اختر من اللغات الجاهزة أو أضف لغة مخصصة' : 'Choose ready language or add custom'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLanguageModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click World Languages */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-300 block mb-2">
                {isRtl ? 'لغات عالمية سريعة بنقرة واحدة:' : 'Popular World Languages:'}
              </span>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {remainingPredefined.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleAddPredefined(item)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-200 border border-slate-700/60"
                  >
                    <span>{item.flag}</span>
                    <span className="truncate">{item.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Language Form */}
            <form onSubmit={handleCreateCustomLanguage} className="space-y-3 border-t border-slate-800 pt-3">
              <span className="text-[11px] font-bold text-amber-400 block">
                {isRtl ? 'أو أدخل لغة مخصصة يدوياً:' : 'Or Enter Custom Language:'}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isRtl ? 'اسم اللغة (Native)' : 'Language Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customLangName}
                    onChange={(e) => setCustomLangName(e.target.value)}
                    placeholder={isRtl ? 'مثال: Svenska, עברית' : 'e.g., Swedish'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isRtl ? 'رمز اللغة (Code)' : 'Code (2 letters)'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={customLangCode}
                    onChange={(e) => setCustomLangCode(e.target.value)}
                    placeholder="sv, he, nl..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isRtl ? 'علم / رمز تعبيري' : 'Flag Emoji'}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={customLangFlag}
                    onChange={(e) => setCustomLangFlag(e.target.value)}
                    placeholder="🇸🇪"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isRtl ? 'اتجاه النص' : 'Text Direction'}
                  </label>
                  <select
                    value={customLangDir}
                    onChange={(e) => setCustomLangDir(e.target.value as 'rtl' | 'ltr')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none cursor-pointer"
                  >
                    <option value="ltr">من اليسار لليمين (LTR)</option>
                    <option value="rtl">من اليمين لليسار (RTL)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {isRtl ? 'حفظ وتفعيل اللغة الآن' : 'Save & Activate Language'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLanguageModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold transition cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
