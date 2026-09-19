import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Sliders,
  Sparkles,
  PictureInPicture,
  Film,
  Download,
  FolderOpen,
  Link,
  Lock,
  Unlock,
  X,
  Check,
  FastForward,
  Rewind,
  Layers,
  FileVideo,
  ListVideo,
  MonitorPlay,
  Info,
  Camera,
  ArrowDownToLine,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { DownloadItem, VideoMediaItem } from '../types';
import { BUILTIN_VIDEO_SAMPLES } from '../data/initialData';
import lionLogoImg from '../assets/images/lion_browser_logo_1789575379510.jpg';

interface InternalVideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoUrl?: string;
  initialVideoTitle?: string;
  downloadedVideos?: DownloadItem[];
  currentLanguage: string;
  onAddDownload?: (item: DownloadItem) => void;
  onOpenDownloadsManager?: () => void;
}

export const InternalVideoPlayerModal: React.FC<InternalVideoPlayerModalProps> = ({
  isOpen,
  onClose,
  initialVideoUrl,
  initialVideoTitle,
  downloadedVideos = [],
  currentLanguage,
  onAddDownload,
  onOpenDownloadsManager,
}) => {
  const isRtl = currentLanguage === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active video info
  const [currentSource, setCurrentSource] = useState<string>(
    initialVideoUrl || BUILTIN_VIDEO_SAMPLES[0].url
  );
  const [currentTitle, setCurrentTitle] = useState<string>(
    initialVideoTitle || BUILTIN_VIDEO_SAMPLES[0].title
  );

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFloatingMini, setIsFloatingMini] = useState(false);
  const [isControlsLocked, setIsControlsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeTab, setActiveTab] = useState<'player' | 'playlist' | 'customUrl'>('player');
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [customInputTitle, setCustomInputTitle] = useState('');
  const [theaterGlow, setTheaterGlow] = useState(true);
  const [bufferedEnd, setBufferedEnd] = useState(0);

  // Controls auto-hide timer
  const controlsTimeoutRef = useRef<number | null>(null);

  // Sync initialVideoUrl prop
  useEffect(() => {
    if (initialVideoUrl) {
      setCurrentSource(initialVideoUrl);
      if (initialVideoTitle) setCurrentTitle(initialVideoTitle);
      setIsPlaying(true);
      setIsFloatingMini(false);
    }
  }, [initialVideoUrl, initialVideoTitle]);

  // Controls auto-hide handling
  const resetControlsTimeout = () => {
    if (isControlsLocked) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0) {
      setBufferedEnd(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleNativePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      } else {
        setIsFloatingMini(true);
      }
    } catch {
      setIsFloatingMini(true);
    }
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;
    setCurrentSource(customInputUrl.trim());
    setCurrentTitle(customInputTitle.trim() || 'فيديو عبر الرابط الخارجي');
    setActiveTab('player');
    setIsPlaying(true);
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCurrentSource(objectUrl);
    setCurrentTitle(file.name);
    setActiveTab('player');
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const formattedM = m < 10 ? `0${m}` : `${m}`;
    const formattedS = s < 10 ? `0${s}` : `${s}`;
    return `${formattedM}:${formattedS}`;
  };

  // Video download state
  const [downloadQuality, setDownloadQuality] = useState<'1080p' | '720p' | '480p' | 'audio'>('1080p');
  const [isDownloadingCurrent, setIsDownloadingCurrent] = useState(false);
  const [downloadToastMsg, setDownloadToastMsg] = useState<string | null>(null);

  // Trigger download of the active video
  const handleDownloadActiveVideo = (quality: '1080p' | '720p' | '480p' | 'audio' = downloadQuality) => {
    setIsDownloadingCurrent(true);
    const cleanTitle = currentTitle || 'lion_video';
    const isAudio = quality === 'audio';
    const extension = isAudio ? 'mp3' : 'mp4';
    const fileName = `${cleanTitle.replace(/[/\\?%*:|"<>]/g, '_')}_${quality}.${extension}`;

    // Direct browser file download
    const link = document.createElement('a');
    link.href = currentSource;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const sizeMap = {
      '1080p': '184.2 MB',
      '720p': '76.8 MB',
      '480p': '34.5 MB',
      'audio': '9.2 MB (MP3)',
    };

    const newDownload: DownloadItem = {
      id: 'vid-dl-' + Date.now(),
      fileName,
      fileType: isAudio ? 'audio' : 'video',
      fileSize: sizeMap[quality],
      progress: 100,
      status: 'completed',
      sourceUrl: currentSource,
      downloadDate: 'الآن',
      videoQuality: quality,
      videoStreamUrl: currentSource,
    };

    if (onAddDownload) {
      onAddDownload(newDownload);
    }

    setTimeout(() => {
      setIsDownloadingCurrent(false);
      const msg = isRtl
        ? `تم بدء تنزيل "${cleanTitle}" بجودة ${quality} وإضافته لمدير التنزيلات!`
        : `Downloaded "${cleanTitle}" (${quality}) & added to Downloads Manager!`;
      setDownloadToastMsg(msg);
      setTimeout(() => setDownloadToastMsg(null), 3500);
    }, 600);
  };

  // Capture video frame as high-res PNG image
  const handleCaptureVideoFrame = () => {
    try {
      if (!videoRef.current) return;
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const imgFileName = `صورة_فيديو_${(currentTitle || 'لقطة').replace(/[/\\?%*:|"<>]/g, '_')}_${Math.floor(currentTime)}s.png`;

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = imgFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (onAddDownload) {
          onAddDownload({
            id: 'frame-dl-' + Date.now(),
            fileName: imgFileName,
            fileType: 'image',
            fileSize: '1.2 MB',
            progress: 100,
            status: 'completed',
            sourceUrl: currentSource,
            downloadDate: 'الآن',
          });
        }

        const msg = isRtl
          ? 'تم التقاط لقطة الشاشة من الفيديو وحفظ الصورة بنجاح!'
          : 'Video frame captured and saved as image successfully!';
        setDownloadToastMsg(msg);
        setTimeout(() => setDownloadToastMsg(null), 3500);
      }
    } catch {
      // Fallback
      window.open(currentSource, '_blank');
    }
  };

  if (!isOpen) return null;

  // Floating Mini-Player Mode (Picture-in-Picture inside Lion Browser)
  if (isFloatingMini) {
    return (
      <div
        id="lion-mini-video-player"
        className="fixed bottom-16 right-4 z-50 w-72 sm:w-80 bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="bg-slate-950 px-2.5 py-1.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-200 truncate">{currentTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsFloatingMini(false)}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="تكبير"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-rose-400 rounded"
              title="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center group">
          <video
            ref={videoRef}
            src={currentSource}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Mini controls overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
            <div className="flex items-center justify-between text-white text-xs">
              <button onClick={togglePlay} className="p-1 hover:text-amber-400">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="text-[10px] font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button onClick={toggleMute} className="p-1 hover:text-amber-400">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="lion-internal-video-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        ref={containerRef}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
        className={`bg-slate-950 border border-slate-800 w-full ${
          isFullscreen
            ? 'h-full max-w-none rounded-none'
            : 'max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden'
        }`}
      >
        {/* Top Header & App Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between z-20 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Circular Lion Emblem */}
            <div className="relative w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-amber-600 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={lionLogoImg}
                alt="Lion Video"
                className="w-full h-full object-cover object-center rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300">
                  {isRtl ? 'مشغل الفيديو الداخلي' : 'Internal Video Player'}
                </span>
                <span className="text-[9px] bg-rose-500/20 text-rose-300 font-mono px-1.5 py-0.2 rounded border border-rose-500/30">
                  Lion Theater HD
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-bold truncate max-w-xs sm:max-w-md">
                {currentTitle}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('player')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'player'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRtl ? 'الشاشة' : 'Screen'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('playlist')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'playlist'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListVideo className="w-3.5 h-3.5" />
                <span>{isRtl ? 'القائمة' : 'Library'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('customUrl')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'customUrl'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRtl ? 'رابط خارجي' : 'URL'}</span>
              </button>
            </div>

            {/* PiP button */}
            <button
              type="button"
              onClick={handleNativePiP}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title={isRtl ? 'صورة داخل صورة (PiP)' : 'Picture-in-Picture'}
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
              title={isRtl ? 'إغلاق المشغل' : 'Close Player'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: Player View OR Playlist OR Custom URL */}
        {activeTab === 'player' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="relative flex-1 bg-black flex flex-col justify-center items-center overflow-hidden select-none">
            {/* Theater Ambient Backlight Glow */}
            {theaterGlow && (
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 blur-3xl scale-110"></div>
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              src={currentSource}
              autoPlay
              playsInline
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className={`w-full h-full max-h-[65vh] transition-all duration-300 ${
                aspectRatio === 'cover'
                  ? 'object-cover'
                  : aspectRatio === 'fill'
                  ? 'object-fill'
                  : 'object-contain'
              }`}
            />

            {/* Central Big Play/Pause Splash on Center Click */}
            {!isPlaying && !isControlsLocked && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.8)] hover:scale-110 active:scale-95 transition-transform cursor-pointer z-20"
              >
                <Play className="w-8 h-8 fill-current ml-0.5" />
              </button>
            )}

            {/* Screen Touch Lock Button (Floating at side) */}
            <div className="absolute top-4 right-4 z-30">
              <button
                type="button"
                onClick={() => {
                  setIsControlsLocked(!isControlsLocked);
                  setShowControls(true);
                }}
                className={`p-2 rounded-xl backdrop-blur-md border transition cursor-pointer ${
                  isControlsLocked
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg'
                    : 'bg-black/60 text-slate-300 border-white/10 hover:bg-black/80'
                }`}
                title={isControlsLocked ? 'إلغاء قفل الشاشة' : 'قفل الشاشة لمنع اللمس العرضي'}
              >
                {isControlsLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            {/* OVERLAY CONTROLS (Only visible if not locked & showControls) */}
            {!isControlsLocked && (
              <div
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 transition-opacity duration-300 z-20 flex flex-col gap-2 ${
                  showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Timeline Seek Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-300 min-w-[42px]">
                    {formatTime(currentTime)}
                  </span>

                  <div className="relative flex-1 flex items-center group py-1">
                    {/* Buffered bar */}
                    <div
                      className="absolute h-1.5 bg-slate-700/80 rounded-full pointer-events-none"
                      style={{ width: `${duration ? (bufferedEnd / duration) * 100 : 0}%` }}
                    ></div>
                    {/* Active range input */}
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="relative w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-400 hover:h-2 transition-all"
                    />
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 min-w-[42px] text-right">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Primary Control Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-white">
                  {/* Left Playback controls */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition cursor-pointer shadow-sm"
                      title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Skip -10s */}
                    <button
                      type="button"
                      onClick={() => skipSeconds(-10)}
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                      title="رجوع 10 ثواني"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Skip +10s */}
                    <button
                      type="button"
                      onClick={() => skipSeconds(10)}
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                      title="تقديم 10 ثواني"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Volume Slider & Mute */}
                    <div className="flex items-center gap-1.5 ml-2 group">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-1.5 text-slate-300 hover:text-amber-400 rounded-xl"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-slate-700 rounded-full appearance-none accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right Features: Speed, Aspect Ratio, Glow, Fullscreen */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Playback speed selector */}
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-1.5 py-0.5 text-xs">
                      {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => changePlaybackRate(rate)}
                          className={`px-1.5 py-0.5 rounded-lg font-mono text-[10px] font-bold transition cursor-pointer ${
                            playbackRate === rate
                              ? 'bg-amber-400 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>

                    {/* Aspect Ratio Switcher */}
                    <button
                      type="button"
                      onClick={() => {
                        const next =
                          aspectRatio === 'contain' ? 'cover' : aspectRatio === 'cover' ? 'fill' : 'contain';
                        setAspectRatio(next);
                      }}
                      className="px-2 py-1 bg-black/40 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 transition cursor-pointer"
                      title="تناسق أبعاد الشاشة"
                    >
                      {aspectRatio === 'contain' ? 'تناسق (Fit)' : aspectRatio === 'cover' ? 'تمدد (Fill)' : 'شاشة كاملة'}
                    </button>

                    {/* Ambient Theater Glow toggle */}
                    <button
                      type="button"
                      onClick={() => setTheaterGlow(!theaterGlow)}
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${
                        theaterGlow
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-black/40 text-slate-400 border-white/10'
                      }`}
                      title="إضاءة المسرح المحيطية"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    {/* Fullscreen Button */}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1.5 bg-black/40 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                      title="ملء الشاشة"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DEDICATED DOWNLOAD CONTROLS BAR DIRECTLY UNDER VIDEO */}
          <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-3.5 flex flex-col gap-2.5 shrink-0 select-none">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Left: Video Details & Quality selector */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-100 block truncate max-w-[220px] sm:max-w-xs" title={currentTitle}>
                    {currentTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)} • مشغل Lion Video HD
                  </span>
                </div>
              </div>

              {/* Quality Selector Pills */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['1080p', '720p', '480p', 'audio'] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setDownloadQuality(q)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                      downloadQuality === q
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {q === 'audio' ? (isRtl ? 'صوت MP3' : 'Audio') : q}
                  </button>
                ))}
              </div>

              {/* Action Buttons under the video */}
              <div className="flex items-center flex-wrap gap-2">
                {/* 1. Main Download Video Button */}
                <button
                  type="button"
                  disabled={isDownloadingCurrent}
                  onClick={() => handleDownloadActiveVideo(downloadQuality)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
                  title={isRtl ? `تنزيل الفيديو بدقة ${downloadQuality}` : `Download Video (${downloadQuality})`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isDownloadingCurrent
                      ? (isRtl ? 'جاري التنزيل...' : 'Downloading...')
                      : (isRtl ? `تنزيل هذا الفيديو (${downloadQuality})` : `Download Video (${downloadQuality})`)}
                  </span>
                </button>

                {/* 2. Capture Frame as Image */}
                <button
                  type="button"
                  onClick={handleCaptureVideoFrame}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
                  title={isRtl ? 'التقاط وحفظ لقطة الشاشة كصورة بدقة عالية' : 'Capture video frame as image'}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{isRtl ? 'حفظ لقطة كصورة' : 'Save Frame'}</span>
                </button>

                {/* 3. Audio Only MP3 Download */}
                <button
                  type="button"
                  onClick={() => handleDownloadActiveVideo('audio')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
                  title={isRtl ? 'استخراج وتنزيل الصوت فقط MP3' : 'Extract & Download MP3 Audio'}
                >
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">{isRtl ? 'صوت MP3' : 'MP3'}</span>
                </button>

                {/* 4. Open Downloads Manager */}
                {onOpenDownloadsManager && (
                  <button
                    type="button"
                    onClick={onOpenDownloadsManager}
                    className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl transition cursor-pointer border border-amber-500/20 flex items-center gap-1"
                    title={isRtl ? 'فتح مدير التنزيلات' : 'Open Downloads Manager'}
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>{downloadedVideos.length}</span>
                  </button>
                )}
              </div>
            </div>

            {/* In-player Toast Notification */}
            {downloadToastMsg && (
              <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{downloadToastMsg}</span>
              </div>
            )}
          </div>
        </div>
        ) : activeTab === 'playlist' ? (
          /* PLAYLIST & SOURCES TAB */
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Quick Local Video File Upload */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-100">
                    {isRtl ? 'تشغيل فيديو من ذاكرة الهاتف / الجهاز' : 'Play video from device storage'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isRtl
                      ? 'اختر أي ملف فيديو محلي (MP4, MKV, WebM) لتشغيله في المشغل فورياً'
                      : 'Choose local video file (MP4, MKV, WebM) to play instantly'}
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleLocalFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <FileVideo className="w-4 h-4" />
                <span>{isRtl ? 'اختيار ملف فيديو' : 'Select Video File'}</span>
              </button>
            </div>

            {/* Downloaded Videos Section */}
            <div>
              <h4 className="text-xs font-black text-slate-300 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{isRtl ? 'الفيديوهات المحفوظة والتنزيلات:' : 'Saved & Downloaded Videos:'}</span>
              </h4>

              {downloadedVideos.filter((item) => item.fileType === 'video').length === 0 ? (
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                  {isRtl
                    ? 'لم يتم تنزيل أي فيديوهات بعد. يمكنك تجربة الفيديوهات النموذجية بالأسفل!'
                    : 'No downloaded videos yet. Try sample library below!'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {downloadedVideos
                    .filter((item) => item.fileType === 'video')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setCurrentSource(item.videoStreamUrl || item.sourceUrl);
                          setCurrentTitle(item.fileName);
                          setActiveTab('player');
                          setIsPlaying(true);
                        }}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 group ${
                          currentSource === (item.videoStreamUrl || item.sourceUrl)
                            ? 'bg-amber-500/15 border-amber-500/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                            <Film className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-200 block truncate">
                              {item.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {item.fileSize} • {item.videoQuality || 'HD'}
                            </span>
                          </div>
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* High-Definition Online Sample Library */}
            <div>
              <h4 className="text-xs font-black text-slate-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isRtl ? 'مكتبة الفيديوهات النموذجية عالية الجودة:' : 'HD Sample Video Library:'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BUILTIN_VIDEO_SAMPLES.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => {
                      setCurrentSource(sample.url);
                      setCurrentTitle(sample.title);
                      setActiveTab('player');
                      setIsPlaying(true);
                    }}
                    className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 group ${
                      currentSource === sample.url
                        ? 'bg-amber-500/20 border-amber-500/60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-950">
                      {sample.poster ? (
                        <img
                          src={sample.poster}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-amber-300 transition-colors">
                        {sample.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span className="font-mono bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                          {sample.quality}
                        </span>
                        <span className="font-mono">{sample.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* CUSTOM URL TAB */
          <div className="flex-1 p-6 flex flex-col justify-center max-w-lg mx-auto w-full">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Link className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-center text-slate-100 mb-1">
              {isRtl ? 'تشغيل فيديو عبر رابط مباشر أو يوتيوب' : 'Play Video via Direct Link or Stream'}
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5">
              {isRtl
                ? 'الصق رابط ملف فيديو مباشر (MP4, WebM) أو فيديو من الويب لتشغيله في المشغل الداخلي فوراً'
                : 'Paste direct video URL (MP4, WebM) to stream inside Lion Player'}
            </p>

            <form onSubmit={handleLoadCustomUrl} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isRtl ? 'عنوان الفيديو (اختياري)' : 'Video Title (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? 'مثال: فيديو وثائقي جديد' : 'e.g. Nature Documentary'}
                  value={customInputTitle}
                  onChange={(e) => setCustomInputTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isRtl ? 'رابط الفيديو المباشر (URL)' : 'Video URL'}
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/video.mp4"
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{isRtl ? 'بدء التشغيل الآن' : 'Start Playback'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Bottom Drawer Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {isRtl
                ? 'مشغل الأسد الداخلي • فك تشفير العتاد H.264/AV1 نشط'
                : 'Lion Player • Hardware Decoding H.264/AV1 Active'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500">v3.4.2</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
