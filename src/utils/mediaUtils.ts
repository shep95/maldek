// Helper function to determine if URL is a video file
export function isVideoFile(url?: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

// Helper function to download media from URL
export async function downloadMedia(url: string, filename?: string) {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `media-${Date.now()}.${url.split('.').pop()}`;
    link.target = '_blank'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Error downloading media:', error);
    return false;
  }
}
