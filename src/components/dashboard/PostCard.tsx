import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/utils/postUtils";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { PostMedia } from "./post/PostMedia";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick?: (mediaUrl: string) => void;
}

export const PostCard = ({ post, currentUserId, onPostAction, onMediaClick }: PostCardProps) => {
  const { data: userSettings } = useQuery({
    queryKey: ['user-settings', currentUserId],
    queryFn: async () => {
      try {
        console.log('Fetching user settings for:', currentUserId);
        const { data: settingsData, error } = await supabase
          .from('user_settings')
          .select('preferred_language')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user settings:', error);
          return { preferred_language: 'en' }; // Default to English
        }

        return settingsData || { preferred_language: 'en' };
      } catch (error) {
        console.error('Error in settings query:', error);
        return { preferred_language: 'en' };
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <div className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4">
      <PostHeader author={post.author} timestamp={post.timestamp} />
      <PostContent 
        content={post.content} 
        userLanguage={userSettings?.preferred_language || 'en'}
        isEditing={false}
      />
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMedia mediaUrls={post.media_urls} onMediaClick={onMediaClick} />
      )}
      <PostActions
        post={post}
        currentUserId={currentUserId}
        onAction={onPostAction}
      />
    </div>
  );
};