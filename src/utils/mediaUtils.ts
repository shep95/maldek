export const isVideoFile = (file: File | string): boolean => {
  if (typeof file === 'string') {
    return file.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  }
  return file.type.startsWith('video/');
};

export const validateMediaFile = async (file: File) => {
  // Maximum file sizes (in bytes)
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

  const isVideo = isVideoFile(file);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
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