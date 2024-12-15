export const createPersistentMediaUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Creating persistent URL for file:', file.name, 'Type:', file.type);
    
    // For testing, accept any file type
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
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
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
  
  // For testing, check if the URL contains any video-related terms
  if (lowercaseUrl.includes('video') || lowercaseUrl.includes('mp4') || lowercaseUrl.includes('mov')) {
    console.log('Video-related term detected in URL');
    return true;
  }
  
  console.log('Not a video URL');
  return false;
};