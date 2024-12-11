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
  // Check if it's an object URL for video
  if (url.startsWith('blob:')) {
    return true;
  }
  
  // Check file extensions as fallback
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};