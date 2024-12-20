import { supabase } from "@/integrations/supabase/client";

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

export const handlePasteEvent = (e: ClipboardEvent): File | null => {
  const items = e.clipboardData?.items;
  if (!items) return null;

  for (const item of Array.from(items)) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        console.log('File pasted:', file.name, file.type, file.size);
        return file;
      }
    }
  }
  return null;
};

export const moderateContent = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: formData,
    });

    if (error || data.error) {
      console.error('Content moderation failed:', error || data.error);
      const categories = data.categories ? ` (${data.categories.join(', ')})` : '';
      return {
        isValid: false,
        error: `Content violates community guidelines${categories}`
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Content moderation error:', error);
    return {
      isValid: false,
      error: 'Failed to verify content safety'
    };
  }
};

export const validateMediaFile = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
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

  // Add content moderation check
  const moderationResult = await moderateContent(file);
  if (!moderationResult.isValid) {
    return moderationResult;
  }
  
  return { isValid: true };
};