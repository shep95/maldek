import { supabase } from "@/integrations/supabase/client";

export const isVideoFile = (file: File | string): boolean => {
  if (typeof file === 'string') {
    return file.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  }
  return file.type.startsWith('video/');
};

const getUserUploadLimit = async (userId: string): Promise<number> => {
  try {
    // Get user's active subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        tier:subscription_tiers(
          max_upload_size_mb
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    // Return the upload limit in bytes
    return (subscription?.tier?.max_upload_size_mb || 50) * 1024 * 1024; // Convert MB to bytes
  } catch (error) {
    console.error('Error fetching user upload limit:', error);
    return 50 * 1024 * 1024; // Default to 50MB if there's an error
  }
};

export const validateMediaFile = async (file: File, userId: string) => {
  const isVideo = isVideoFile(file);
  const maxImageSize = 10 * 1024 * 1024; // 10MB for images
  
  // Get user's upload limit for videos
  const maxVideoSize = await getUserUploadLimit(userId);

  const maxSize = isVideo ? maxVideoSize : maxImageSize;
  const maxSizeMB = maxSize / (1024 * 1024);

  console.log('Validating file:', {
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    fileType: file.type,
    isVideo,
    maxAllowedSize: `${maxSizeMB}MB`,
    userId
  });

  // Check file size
  if (file.size > maxSize) {
    const errorMessage = isVideo
      ? `Video too large. Maximum size is ${maxSizeMB}MB. Upgrade to Creator or Business plan for 3GB uploads.`
      : `Image too large. Maximum size is ${maxSizeMB}MB`;

    return {
      isValid: false,
      error: errorMessage
    };
  }

  // Validate file type
  if (isVideo) {
    if (!file.type.match(/^video\/(mp4|webm|ogg|quicktime)$/)) {
      return {
        isValid: false,
        error: 'Invalid video format. Supported formats: MP4, WebM, OGG, MOV'
      };
    }
  } else {
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      return {
        isValid: false,
        error: 'Invalid image format. Supported formats: JPEG, PNG, GIF, WebP'
      };
    }
  }

  return {
    isValid: true,
    error: null
  };
};