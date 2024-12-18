export const createPersistentMediaUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Creating persistent URL for file:', file.name, 'Type:', file.type);
    
    const url = URL.createObjectURL(file);
    console.log('Created URL:', url);
    resolve(url);
  });
};

export const isVideoFile = (url: string): boolean => {
  console.log('Checking if URL is video:', url);
  
  // Check if it's a blob URL for video
  if (url.startsWith('blob:')) {
    console.log('Blob URL detected');
    return true;
  }
  
  // Check common video file extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.avi', '.wmv', '.flv', '.mkv'];
  const lowercaseUrl = url.toLowerCase();
  
  // Check file extensions
  const hasVideoExtension = videoExtensions.some(ext => lowercaseUrl.endsWith(ext));
  if (hasVideoExtension) {
    console.log('Video extension detected:', lowercaseUrl);
    return true;
  }
  
  // Check if URL contains video-specific paths or identifiers
  if (lowercaseUrl.includes('/videos/') || lowercaseUrl.includes('video')) {
    console.log('Video path detected');
    return true;
  }
  
  console.log('Not a video URL');
  return false;
};

export const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
  if (isVideoFile(url)) return 'video';
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
  const lowercaseUrl = url.toLowerCase();
  
  if (imageExtensions.some(ext => lowercaseUrl.endsWith(ext))) return 'image';
  if (url.startsWith('data:image/')) return 'image';
  
  return 'unknown';
};

export const validateMediaFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than 50MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }
  
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported`
    };
  }
  
  return { isValid: true };
};