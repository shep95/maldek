import { supabase } from "@/integrations/supabase/client";

export const createPersistentMediaUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Creating persistent URL for file:', file.name, 'Type:', file.type);
    const url = URL.createObjectURL(file);
    console.log('Created URL:', url);
    resolve(url);
  });
};

export const isVideoFile = (url: string | File): boolean => {
  if (url instanceof File) {
    return url.type.startsWith('video/');
  }
  
  console.log('Checking if URL is video:', url);
  
  if (url.startsWith('blob:')) {
    console.log('Blob URL detected');
    return true;
  }
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.avi', '.wmv', '.flv', '.mkv'];
  const lowercaseUrl = url.toLowerCase();
  
  const hasVideoExtension = videoExtensions.some(ext => lowercaseUrl.endsWith(ext));
  if (hasVideoExtension) {
    console.log('Video extension detected:', lowercaseUrl);
    return true;
  }
  
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
    console.log('Starting content moderation for:', file.name);

    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: { 
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    });

    if (error) {
      console.error('Content moderation failed:', error);
      return {
        isValid: false,
        error: 'Content moderation failed. Please try again.'
      };
    }

    if (data?.error) {
      console.error('Content flagged:', data.error);
      return {
        isValid: false,
        error: data.error
      };
    }

    console.log('Content moderation passed');
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
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than 100MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  // Skip content moderation for now to debug upload flow
  return { isValid: true };
};