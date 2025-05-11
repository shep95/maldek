
// Helper function to determine if URL is a video file
export function isVideoFile(input?: string | File): boolean {
  if (!input) return false;
  
  // If input is a File object
  if (input instanceof File) {
    return input.type.startsWith('video/');
  }
  
  // If input is a string (URL)
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
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

// Validate media files for size and type
export async function validateMediaFile(file: File, userId: string): Promise<{ isValid: boolean; error?: string }> {
  // Check file size (max 50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds the 50MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
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
      
      // Check if video is too long (> 5 minutes)
      if (video.duration > 300) { // 5 minutes in seconds
        return {
          isValid: false,
          error: 'Video is too long. Maximum duration is 5 minutes.'
        };
      }
    } catch (error) {
      console.error('Error validating video:', error);
      // Allow video if we can't validate duration
    }
  }

  return { isValid: true };
}
