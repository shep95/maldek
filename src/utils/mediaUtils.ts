export const createPersistentMediaUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For videos, create an object URL instead of base64
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      console.log('Created video URL:', url);
      resolve(url);
      return;
    }

    // For images, use base64 as before
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('Created image URL (base64)');
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      console.error('Error reading file:', file.name);
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    reader.readAsDataURL(file);
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
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  const lowercaseUrl = url.toLowerCase();
  
  // Check file extensions
  if (videoExtensions.some(ext => lowercaseUrl.endsWith(ext))) {
    console.log('Video extension detected');
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