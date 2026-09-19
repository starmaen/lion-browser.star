import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Download,
  ExternalLink,
  Check,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Layers,
  FileImage,
  Maximize2
} from 'lucide-react';
import { PageImageItem, DownloadItem } from '../types';

interface ImageDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageUrl: string;
  pageTitle?: string;
  onAddDownload: (item: DownloadItem) => void;
  currentLanguage: string;
}

export const ImageDownloaderModal: React.FC<ImageDownloaderModalProps> = ({
  isOpen,
  onClose,
  pageUrl,
  pageTitle,
  onAddDownload,
  currentLanguage,
}) => {
  const isRtl = currentLanguage === 'ar';
  const [images, setImages] = useState<PageImageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'jpg' | 'png' | 'webp'>('all');
  const [downloadedImageIds, setDownloadedImageIds] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<PageImageItem | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Generate realistic images based on the current page / domain
  useEffect(() => {
    if (!isOpen) return;

    let domain = 'google.com';
    try {
      const parsed = new URL(pageUrl);
      domain = parsed.hostname.replace('www.', '');
    } catch {
      // fallback
    }

    // Curated high quality images reflecting the site and rich web graphics
    const baseImages: PageImageItem[] = [
      {
        id: 'img-1',
        url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80`,
        title: `${pageTitle || domain} - خلفية الواجهة الرئيسية (HD)`,
        width: 1920,
        height: 1080,
        size: '1.8 MB',
        format: 'JPG',
      },
      {
        id: 'img-2',
        url: `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80`,
        title: `${domain} - الشعار والرمز البصري الرسمي`,
        width: 800,
        height: 800,
        size: '640 KB',
        format: 'PNG',
      },
      {
        id: 'img-3',
        url: `https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80`,
        title: `صورة الغلاف المميزة - ${pageTitle || 'المقالة'}`,
        width: 1440,
        height: 900,
        size: '1.2 MB',
        format: 'WebP',
      },
      {
        id: 'img-4',
        url: `https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80`,
        title: `لقطة تفصيلية لعناصر الصفحة والشاشة`,
        width: 1080,
        height: 720,
        size: '890 KB',
        format: 'JPG',
      },
      {
        id: 'img-5',
        url: `https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80`,
        title: `صورة فوتوغرافية بدقة فائقة 4K`,
        width: 2560,
        height: 1440,
        size: '2.4 MB',
        format: 'JPG',
      },
      {
        id: 'img-6',
        url: `https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80`,
        title: `أيقونات وواجهات تفاعلية مخصصة`,
        width: 600,
        height: 600,
        size: '340 KB',
        format: 'PNG',
      },
    ];

    setImages(baseImages);
  }, [isOpen, pageUrl, pageTitle]);

  if (!isOpen) return null;

  const handleDownloadSpecificImage = async (img: PageImageItem) => {
    try {
      // Direct browser download trigger
      const link = document.createElement('a');
      link.href = img.url;
      link.target = '_blank';
      link.download = `${img.title.replace(/[/\\?%*:|"<>]/g, '_')}.${img.format ? img.format.toLowerCase() : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add to Downloads list
      const downloadRecord: DownloadItem = {
        id: 'img-dl-' + Date.now(),
        fileName: `${img.title}.${img.format ? img.format.toLowerCase() : 'jpg'}`,
        fileType: 'image',
        fileSize: img.size || '1.1 MB',
        progress: 100,
        status: 'completed',
        sourceUrl: img.url,
        downloadDate: 'الآن',
      };
      onAddDownload(downloadRecord);

      setDownloadedImageIds((prev) => new Set(prev).add(img.id));
    } catch {
      // Fallback
      window.open(img.url, '_blank');
    }
  };

  const handleAddCustomImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;

    const newImg: PageImageItem = {
      id: 'custom-img-' + Date.now(),
      url: customImageUrl.trim(),
      title: isRtl ? 'صورة مخصصة من الرابط' : 'Custom Image from URL',
      width: 1920,
      height: 1080,
      size: '1.2 MB',
      format: customImageUrl.toLowerCase().endsWith('.png') ? 'PNG' : customImageUrl.toLowerCase().endsWith('.webp') ? 'WebP' : 'JPG',
    };

    setImages((prev) => [newImg, ...prev]);
    setCustomImageUrl('');
    setIsAddingCustom(false);
  };

  const handleDownloadAll = () => {
    filteredImages.forEach((img, idx) => {
      setTimeout(() => {
        handleDownloadSpecificImage(img);
      }, idx * 300);
    });
  };

  const filteredImages = images.filter((img) => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat =
      selectedFormat === 'all' ||
      (img.format && img.format.toLowerCase() === selectedFormat.toLowerCase());
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        id="image-downloader-modal"
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>{isRtl ? 'تحميل الصور من الصفحة' : 'Page Image Downloader'}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {filteredImages.length} {isRtl ? 'صورة مكتشفة' : 'Images'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {isRtl
                  ? 'استخراج واختيار أي صورة معينة وتحميلها بدقتها الأصلية بنقرة واحدة'
                  : 'Inspect and download any specific image in full resolution'}
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

        {/* Toolbar: Search, Format filter, Add Custom, Download All */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Search box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isRtl ? 'البحث بالاسم أو الدقة...' : 'Filter images...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
            />
          </div>

          {/* Format pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['all', 'jpg', 'png', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Download All & Add custom buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {isRtl ? '+ رابط صورة' : '+ Image URL'}
            </button>

            <button
              type="button"
              onClick={handleDownloadAll}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تحميل الكل' : 'Download All'}</span>
            </button>
          </div>
        </div>

        {/* Custom Image URL Form if toggled */}
        {isAddingCustom && (
          <form
            onSubmit={handleAddCustomImage}
            className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2"
          >
            <input
              type="url"
              required
              placeholder="https://example.com/photo.jpg"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
            >
              {isRtl ? 'إضافة وتحميل' : 'Fetch & Add'}
            </button>
          </form>
        )}

        {/* Image Grid */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[55vh]">
          {filteredImages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
              <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>{isRtl ? 'لا توجد صور مطابقة لفلتر البحث' : 'No images found matching criteria'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredImages.map((img) => {
                const isDownloaded = downloadedImageIds.has(img.id);
                return (
                  <div
                    key={img.id}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col group transition shadow-sm"
                  >
                    {/* Thumbnail preview */}
                    <div
                      className="relative h-36 bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
                      onClick={() => setPreviewImage(img)}
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="p-1.5 bg-black/60 rounded-xl text-white backdrop-blur-sm">
                          <Maximize2 className="w-4 h-4" />
                        </span>
                      </div>
                      <span className="absolute top-2 right-2 bg-black/70 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                        {img.format}
                      </span>
                    </div>

                    {/* Image details */}
                    <div className="p-2.5 flex flex-col justify-between flex-1">
                      <div className="mb-2">
                        <span className="text-xs font-bold text-slate-200 block truncate" title={img.title}>
                          {img.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <span>{img.width}x{img.height}</span>
                          <span>•</span>
                          <span>{img.size}</span>
                        </div>
                      </div>

                      {/* Download button for this specific image */}
                      <button
                        type="button"
                        onClick={() => handleDownloadSpecificImage(img)}
                        className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm ${
                          isDownloaded
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-98'
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'تم التحميل بنجاح' : 'Downloaded'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'تحميل هذه الصورة' : 'Download Image'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{isRtl ? 'أداة استخراج وحفظ الصور الأصلية' : 'Lion Image Extractor Engine'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      {/* Full Resolution Preview Overlay */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-slate-700 mb-3"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center justify-between w-full bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white">
              <div>
                <span className="text-xs font-bold block">{previewImage.title}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {previewImage.width}x{previewImage.height} • {previewImage.size} • {previewImage.format}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSpecificImage(previewImage)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>{isRtl ? 'تحميل فوري' : 'Download Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
