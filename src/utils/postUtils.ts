
import { supabase } from "@/integrations/supabase/client";

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

  // Check video duration with fallback
  try {
    const duration = await getVideoDuration(file);
    
    if (duration > 900) { // 15 minutes = 900 seconds
      return { 
        allowed: false, 
        message: "Videos must be less than 15 minutes in length."
      };
    }
  } catch (error) {
    console.warn('Could not determine video duration, allowing upload:', error);
    // Continue with upload if we can't determine duration
    // This prevents blocking valid uploads due to metadata issues
  }

  // Check if user has already uploaded a video today
  try {
    const hasUploadedToday = await hasUploadedVideoToday(userId);
    if (hasUploadedToday) {
      return {
        allowed: false,
        message: "You can only upload one video per day."
      };
    }
  } catch (error) {
    console.warn('Could not check video upload history, allowing upload:', error);
    // Continue with upload if we can't check history
  }

  return { allowed: true };
};

// Helper function to get video duration - now exported
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true; // Add muted to avoid autoplay issues
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Video metadata loading timeout"));
    }, 10000); // 10 second timeout
    
    const cleanup = () => {
      if (video.src) {
        window.URL.revokeObjectURL(video.src);
      }
      clearTimeout(timeout);
    };
    
    video.onloadedmetadata = () => {
      cleanup();
      resolve(video.duration || 0);
    };
    
    video.onerror = (error) => {
      cleanup();
      console.error("Video metadata error:", error);
      reject(new Error("Error loading video metadata"));
    };
    
    try {
      video.src = URL.createObjectURL(file);
    } catch (error) {
      cleanup();
      reject(new Error("Error creating video URL"));
    }
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
