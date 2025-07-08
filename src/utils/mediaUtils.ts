
// Helper function to determine if URL is a video file
export function isVideoFile(input?: string | File): boolean {
  if (!input) return false;
  
  // If input is a File object
  if (input instanceof File) {
    return input.type.startsWith('video/');
  }
  
  // If input is a string (URL)
  const videoExtensions = [
    '.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv', 
    '.m4v', '.3gp', '.3g2', '.asf', '.rm', '.rmvb', '.vob', '.ts', 
    '.mts', '.m2ts', '.divx', '.xvid', '.f4v', '.swf', '.mpg', 
    '.mpeg', '.mpv', '.mp2', '.mpe', '.mpv2', '.m2v', '.svi', 
    '.3gp2', '.mxf', '.roq', '.nsv', '.f4p', '.f4a', '.f4b'
  ];
  return videoExtensions.some(ext => input.toLowerCase().endsWith(ext));
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

// Validate media files with different limits for private vs public content
export async function validateMediaFile(
  file: File, 
  userId: string, 
  isPrivateContent: boolean = false
): Promise<{ isValid: boolean; error?: string }> {
  // Different size limits for private vs public content
  const MAX_PUBLIC_FILE_SIZE = 100 * 1024; // 100KB for public posts
  const MAX_PRIVATE_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4GB for private content
  
  const maxSize = isPrivateContent ? MAX_PRIVATE_FILE_SIZE : MAX_PUBLIC_FILE_SIZE;
  const sizeLabel = isPrivateContent ? '4GB' : '100KB';
  
  // Check file size
  if (file.size > maxSize) {
    const actualSize = isPrivateContent 
      ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`
      : `${(file.size / 1024).toFixed(2)}KB`;
    
    return {
      isValid: false,
      error: `File size exceeds the ${sizeLabel} limit (${actualSize})`
    };
  }

  // Check file type
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return {
      isValid: false,
      error: 'Only image and video files are supported'
    };
  }

  // Additional validation for video files
  if (file.type.startsWith('video/')) {
    try {
      // Check video duration (optional)
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video metadata'));
        video.src = URL.createObjectURL(file);
      });

      // Clean up
      URL.revokeObjectURL(video.src);
      
      // For private content, allow longer videos (up to 2 hours)
      const maxDuration = isPrivateContent ? 7200 : 300; // 2 hours vs 5 minutes
      const durationLabel = isPrivateContent ? '2 hours' : '5 minutes';
      
      if (video.duration > maxDuration) {
        return {
          isValid: false,
          error: `Video is too long. Maximum duration is ${durationLabel}.`
        };
      }
    } catch (error) {
      console.error('Error validating video:', error);
      // Allow video if we can't validate duration
    }
  }

  return { isValid: true };
}
