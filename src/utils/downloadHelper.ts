/**
 * Real File Downloader Helper for Lion Browser
 * Ensures all download actions trigger real, native file downloads in the user's browser
 */

export function triggerBrowserDownload(
  urlOrContent: string | Blob,
  filename: string,
  mimeType: string = 'application/octet-stream'
) {
  try {
    let downloadUrl: string;
    let shouldRevoke = false;

    if (urlOrContent instanceof Blob) {
      downloadUrl = URL.createObjectURL(urlOrContent);
      shouldRevoke = true;
    } else if (typeof urlOrContent === 'string') {
      if (urlOrContent.startsWith('blob:') || urlOrContent.startsWith('data:')) {
        downloadUrl = urlOrContent;
      } else if (urlOrContent.startsWith('http://') || urlOrContent.startsWith('https://')) {
        // Route through our backend download endpoint with Content-Disposition: attachment
        downloadUrl = `/api/download/proxy?url=${encodeURIComponent(urlOrContent)}&filename=${encodeURIComponent(filename)}`;
      } else {
        // Raw text or HTML content
        const blob = new Blob([urlOrContent], { type: mimeType });
        downloadUrl = URL.createObjectURL(blob);
        shouldRevoke = true;
      }
    } else {
      return false;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      if (shouldRevoke) {
        URL.revokeObjectURL(downloadUrl);
      }
    }, 2000);

    return true;
  } catch (err) {
    console.error('Download trigger failed:', err);
    return false;
  }
}

/**
 * Downloads a real video file (MP4) to device storage
 */
export async function downloadRealVideo(
  sourceUrl: string,
  filename: string,
  quality: string = '1080p'
): Promise<boolean> {
  const safeFilename = (filename || 'video').endsWith('.mp4') ? filename : `${filename}_${quality}.mp4`;

  // Use backend video download endpoint or direct sample MP4
  const downloadTarget = `/api/download/video?url=${encodeURIComponent(sourceUrl)}&filename=${encodeURIComponent(safeFilename)}`;
  return triggerBrowserDownload(downloadTarget, safeFilename, 'video/mp4');
}
