
export interface Author {
  id: string;
  username: string;
  avatar_url: string | null;
  name?: string;
  subscription?: {
    name: string;
    checkmark_color: string;
  } | null;
}

export interface Post {
  id: string;
  content: string;
  user_id: string;
  author: Author;
  timestamp: Date;
  media_urls: string[];
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
  view_count?: number;
  is_edited?: boolean;
  original_content?: string | null;
}

// New function to check if video upload is allowed based on restrictions
export const checkVideoUploadRestrictions = async (
  file: File,
  userId: string
): Promise<{ allowed: boolean; message?: string }> => {
  // Check if file is a video
  if (!file.type.startsWith('video/')) {
    return { allowed: true }; // Not a video, so no restrictions apply
  }

  // Check video duration
  try {
    const duration = await getVideoDuration(file);
    
    if (duration > 900) { // 15 minutes = 900 seconds
      return { 
        allowed: false, 
        message: "Videos must be less than 15 minutes in length."
      };
    }

    // Check if user has already uploaded a video today
    const hasUploadedToday = await hasUploadedVideoToday(userId);
    if (hasUploadedToday) {
      return {
        allowed: false,
        message: "You can only upload one video per day."
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking video restrictions:', error);
    return { 
      allowed: false, 
      message: "There was an error processing your video. Please try again." 
    };
  }
};

// Helper function to get video duration
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve(video.duration);
      window.URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      reject("Error loading video metadata");
      window.URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// Helper function to check if the user has already uploaded a video today
const hasUploadedVideoToday = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, created_at, media_urls')
      .eq('user_id', userId)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .lt('created_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString());
    
    if (error) throw error;
    
    // Check if any posts today have video uploads
    const postsWithVideos = data?.filter(post => 
      post.media_urls?.some((url: string) => 
        url.match(/\.(mp4|webm|mov|avi|wmv)$/i)
      )
    );
    
    return postsWithVideos && postsWithVideos.length > 0;
  } catch (error) {
    console.error('Error checking previous video uploads:', error);
    return false; // In case of error, allow upload to avoid blocking users
  }
};

export const createNewPost = async (content: string, mediaFiles: File[], author: Author): Promise<Post> => {
  const mediaUrls = await Promise.all(
    mediaFiles.map(async (file) => {
      if (file.type.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return URL.createObjectURL(file);
    })
  );

  return {
    id: crypto.randomUUID(),
    content,
    user_id: author.id,
    author,
    timestamp: new Date(),
    media_urls: mediaUrls,
    likes: 0,
    comments: 0,
    reposts: 0,
    isLiked: false,
    isBookmarked: false,
    view_count: 0,
    is_edited: false,
    original_content: null
  };
};
