
import { supabase } from "@/integrations/supabase/client";

export const isVideoFile = (file: File | string): boolean => {
  if (typeof file === 'string') {
    return file.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  }
  return file.type.startsWith('video/');
};

const getUserUploadLimit = async (userId: string): Promise<number> => {
  try {
    console.log('Checking upload limit for user:', userId);
    
    // Get user's active subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        tier:subscription_tiers(
          name,
          max_upload_size_mb
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return 50 * 1024 * 1024; // Default to 50MB if there's an error
    }

    // Check subscription tier
    if (subscription?.tier?.name === 'True Emperor') {
      console.log('True Emperor subscription detected - allowing 10TB upload');
      return 10 * 1024 * 1024 * 1024 * 1024; // 10TB for Emperor
    } else if (subscription?.tier?.name === 'Business') {
      console.log('Business subscription detected - allowing 3GB upload');
      return 3 * 1024 * 1024 * 1024; // 3GB for Business
    } else if (subscription?.tier?.name === 'Creator') {
      console.log('Creator subscription detected - allowing 1GB upload');
      return 1024 * 1024 * 1024; // 1GB for Creator
    }

    // Default limit for basic users
    return 50 * 1024 * 1024; // 50MB default
  } catch (error) {
    console.error('Error fetching user upload limit:', error);
    return 50 * 1024 * 1024; // Default to 50MB if there's an error
  }
};

export const validateMediaFile = async (file: File, userId: string) => {
  const isVideo = isVideoFile(file);
  const maxImageSize = 20 * 1024 * 1024; // 20MB for images (increased from 10MB)
  
  // Get user's upload limit for videos
  const maxVideoSize = await getUserUploadLimit(userId);
  const maxSize = isVideo ? maxVideoSize : maxImageSize;
  const maxSizeMB = maxSize / (1024 * 1024);

  console.log('Validating file:', {
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    fileType: file.type,
    isVideo,
    maxAllowedSize: `${(maxSize / (1024 * 1024)).toFixed(2)}MB`,
    userId,
    subscriptionTier: 'Fetched in getUserUploadLimit'
  });

  // Check file size
  if (file.size > maxSize) {
    const errorMessage = isVideo
      ? `Video too large. Maximum size is ${(maxSize / (1024 * 1024 * 1024)).toFixed(2)}GB for your subscription tier.`
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
