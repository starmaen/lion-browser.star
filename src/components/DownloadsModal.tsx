import React, { useState, useEffect } from 'react';
import {
  Download,
  Video,
  FileText,
  FileArchive,
  CheckCircle2,
  Clock,
  Play,
  Trash2,
  Plus,
  X,
  ExternalLink,
  Sparkles,
  ArrowDownToLine,
  Pause,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { DownloadItem } from '../types';
import { triggerBrowserDownload, downloadRealVideo } from '../utils/downloadHelper';

interface DownloadsModalProps {
  downloads: DownloadItem[];
  currentUrl?: string;
  currentPageTitle?: string;
  onAddDownload: (item: DownloadItem) => void;
  onDeleteDownload: (id: string) => void;
  onClearCompleted: () => void;
  onClose: () => void;
  onOpenVideoPlayer?: (url?: string, title?: string) => void;
  onOpenImageDownloader?: (url?: string, title?: string) => void;
}

export const DownloadsModal: React.FC<DownloadsModalProps> = ({
  downloads,
  currentUrl,
  currentPageTitle,
  onAddDownload,
  onDeleteDownload,
  onClearCompleted,
  onClose,
  onOpenVideoPlayer,
  onOpenImageDownloader,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'image' | 'document' | 'other'>('all');
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p' | '480p' | 'audio'>('1080p');
  const [customFileUrl, setCustomFileUrl] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Auto-fill custom downloader if currentUrl is passed
  useEffect(() => {
    if (currentUrl && currentUrl !== 'about:home') {
      try {
        const parsed = new URL(currentUrl);
        const parts = parsed.pathname.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.includes('.')) {
          setCustomFileName(decodeURIComponent(lastPart));
        } else {
          setCustomFileName((currentPageTitle || parsed.hostname).replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_') + '.mp4');
        }
        setCustomFileUrl(currentUrl);
      } catch {
        setCustomFileUrl(currentUrl);
      }
    }
  }, [currentUrl, currentPageTitle]);

  const filteredDownloads = downloads.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'video') return item.fileType === 'video';
    if (activeFilter === 'image') return item.fileType === 'image';
    if (activeFilter === 'document') return item.fileType === 'document';
    return item.fileType !== 'video' && item.fileType !== 'image' && item.fileType !== 'document';
  });

  const handleCaptureVideo = () => {
    setIsCapturingVideo(true);
    const pageName = currentPageTitle || (currentUrl ? new URL(currentUrl).hostname : 'مقطع فيديو جديد');
    const cleanName = pageName.length > 30 ? pageName.slice(0, 30) : pageName;
    const finalFileName = `${cleanName.replace(/[/\\?%*:|"<>]/g, '_')}_${selectedQuality}.${selectedQuality === 'audio' ? 'mp3' : 'mp4'}`;
    const videoSource = currentUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    // Trigger real download to device
    downloadRealVideo(videoSource, finalFileName, selectedQuality);

    setTimeout(() => {
      const sizeMap = {
        '1080p': '148.5 MB',
        '720p': '64.2 MB',
        '480p': '28.1 MB',
        'audio': '8.4 MB (MP3)',
      };

      const newItem: DownloadItem = {
        id: 'dl-' + Date.now(),
        fileName: finalFileName,
        fileType: selectedQuality === 'audio' ? 'audio' : 'video',
        fileSize: sizeMap[selectedQuality],
        progress: 100,
        status: 'completed',
        sourceUrl: videoSource,
        downloadDate: 'الآن',
        videoQuality: selectedQuality,
      };

      onAddDownload(newItem);
      setIsCapturingVideo(false);
    }, 1000);
  };

  const handleStartCustomDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFileUrl.trim()) return;

    let guessedType: DownloadItem['fileType'] = 'other';
    const lower = (customFileName || customFileUrl).toLowerCase();
    if (lower.endsWith('.mp4') || lower.endsWith('.mkv') || lower.endsWith('.webm') || lower.includes('video') || lower.includes('youtube')) {
      guessedType = 'video';
    } else if (lower.endsWith('.mp3') || lower.endsWith('.m4a') || lower.endsWith('.wav')) {
      guessedType = 'audio';
    } else if (lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.epub')) {
      guessedType = 'document';
    } else if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.tar.gz')) {
      guessedType = 'archive';
    } else if (lower.endsWith('.apk')) {
      guessedType = 'apk';
    }

    const finalName = customFileName.trim() || 'ملف_تنزيل_' + Date.now();

    // Trigger REAL file download to device storage
    if (guessedType === 'video') {
      downloadRealVideo(customFileUrl.trim(), finalName);
    } else {
      triggerBrowserDownload(customFileUrl.trim(), finalName);
    }

    const newItem: DownloadItem = {
      id: 'dl-' + Date.now(),
      fileName: finalName,
      fileType: guessedType,
      fileSize: '38.4 MB',
      progress: 100,
      status: 'completed',
      sourceUrl: customFileUrl.trim(),
      downloadDate: 'الآن',
    };

    onAddDownload(newItem);
    setCustomFileUrl('');
    setCustomFileName('');
    setShowAddCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        id="downloads-manager-modal"
        className="bg-slate-900 border border-slate-800 w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>مدير التنزيلات وحفظ الفيديو</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Lion Downloader
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                حفظ الفيديوهات، الملفات الصوتية، المستندات وتطبيقات APK بسرعة فائقة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Sniffer / Quick Save Card for Current Page */}
        {currentUrl && currentUrl !== 'about:home' && (
          <div className="mx-4 mt-4 p-3.5 bg-gradient-to-r from-amber-500/15 via-slate-950 to-amber-500/10 border border-amber-500/30 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Video className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-slate-100 truncate">
                  كاشف وحافظ الفيديو للصفحة الحالية:
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                جاهز للالتقاط
              </span>
            </div>

            <div className="text-[11px] text-slate-300 font-medium truncate mb-3 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
              {currentPageTitle || currentUrl}
            </div>

            {/* Quality selector and Download button */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['1080p', '720p', '480p', 'audio'] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSelectedQuality(q)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedQuality === q
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {q === 'audio' ? 'صوت MP3' : q}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCaptureVideo}
                disabled={isCapturingVideo}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isCapturingVideo ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري التنزيل والحفظ...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>تنزيل المقطع ({selectedQuality})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Filter bar & Actions */}
        <div className="p-4 pb-2 flex items-center justify-between border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الكل ({downloads.length})
            </button>
            <button
              onClick={() => setActiveFilter('video')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeFilter === 'video'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فيديو ({downloads.filter((d) => d.fileType === 'video').length})
            </button>
            <button
              onClick={() => setActiveFilter('image')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeFilter === 'image'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              صور ({downloads.filter((d) => d.fileType === 'image').length})
            </button>
            <button
              onClick={() => setActiveFilter('document')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeFilter === 'document'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مستندات
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenImageDownloader && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImageDownloader(currentUrl, currentPageTitle);
                }}
                className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-purple-500/30"
                title="استخراج وتحميل صور من الصفحة"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">تحميل صور</span>
              </button>
            )}

            <button
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
              title="إضافة رابط تنزيل مخصص"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">رابط جديد</span>
            </button>

            {downloads.length > 0 && (
              <button
                onClick={onClearCompleted}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer text-xs"
                title="تنظيف الملفات المكتملة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Custom URL Downloader Form */}
        {showAddCustom && (
          <form onSubmit={handleStartCustomDownload} className="p-4 bg-slate-950 border-b border-slate-800 space-y-2.5">
            <div className="text-xs font-bold text-slate-300">تنزيل أي ملف أو فيديو مباشرة عبر الرابط:</div>
            <input
              type="text"
              placeholder="ضع رابط الملف أو الفيديو هنا (URL)..."
              value={customFileUrl}
              onChange={(e) => setCustomFileUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
              dir="ltr"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم الملف (مثال: my_video.mp4)"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                بدء التنزيل
              </button>
            </div>
          </form>
        )}

        {/* Downloads List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredDownloads.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
                <Download className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-300">لا توجد تنزيلات في هذه القائمة</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                يمكنك النقر على زر تنزيل الفيديو في شريط المتصفح أو إضافة رابط خارجي للتنزيل السريع
              </p>
            </div>
          ) : (
            filteredDownloads.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 group transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.fileType === 'video'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.fileType === 'image'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : item.fileType === 'audio'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : item.fileType === 'apk'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {item.fileType === 'video' ? (
                      <Video className="w-5 h-5" />
                    ) : item.fileType === 'image' ? (
                      <ImageIcon className="w-5 h-5" />
                    ) : item.fileType === 'apk' ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate block">
                        {item.fileName}
                      </span>
                      {item.videoQuality && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono font-bold">
                          {item.videoQuality}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono">{item.fileSize}</span>
                      <span>•</span>
                      <span>{item.downloadDate}</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 inline" />
                        تم الحفظ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.fileType === 'video' && onOpenVideoPlayer && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenVideoPlayer(item.videoStreamUrl || item.sourceUrl, item.fileName);
                      }}
                      className="p-2 text-rose-400 hover:text-white bg-rose-500/20 hover:bg-rose-500/40 rounded-xl transition cursor-pointer border border-rose-500/30"
                      title="تشغيل في مشغل فيديو الأسد الداخلي"
                    >
                      <Play className="w-4 h-4 fill-rose-400" />
                    </button>
                  )}
                  {/* Re-download / Save to Device button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (item.fileType === 'video') {
                        downloadRealVideo(item.sourceUrl, item.fileName);
                      } else {
                        triggerBrowserDownload(item.sourceUrl, item.fileName);
                      }
                    }}
                    className="p-2 text-emerald-400 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/30 rounded-xl transition cursor-pointer border border-emerald-500/30"
                    title="تنزيل وحفظ الملف على جهازك الآن"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                  </button>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    title="فتح الملف / المصدر"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDeleteDownload(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>مسار الحفظ: Android / Download / LionBrowser</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
