import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/utils/postUtils";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { PostMedia } from "./post/PostMedia";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick?: (mediaUrl: string) => void;
}

export const PostCard = ({ post, currentUserId, onPostAction, onMediaClick }: PostCardProps) => {
  const navigate = useNavigate();
  
  const { data: userSettings } = useQuery({
    queryKey: ['user-settings', currentUserId],
    queryFn: async () => {
      try {
        console.log('Fetching user settings for:', currentUserId);
        if (!currentUserId) {
          console.log('No user ID provided, using default settings');
          return { preferred_language: 'en' };
        }

        const { data: settingsData, error } = await supabase
          .from('user_settings')
          .select('preferred_language')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user settings:', error);
          return { preferred_language: 'en' };
        }

        if (!settingsData) {
          console.log('No settings found, creating default settings');
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: currentUserId,
              preferred_language: 'en'
            });

          if (insertError) {
            console.error('Error creating default settings:', insertError);
          }
          return { preferred_language: 'en' };
        }

        return settingsData;
      } catch (error) {
        console.error('Error in settings query:', error);
        return { preferred_language: 'en' };
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleDelete = async () => {
    try {
      console.log('Attempting to delete post:', post.id);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      console.log('Post deleted successfully');
      onPostAction(post.id, 'delete');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    if (
      (e.target as HTMLElement).tagName === 'BUTTON' ||
      (e.target as HTMLElement).tagName === 'A' ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('a')
    ) {
      return;
    }
    console.log('Navigating to post:', post.id);
    navigate(`/post/${post.id}`);
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post click
    console.log('Navigating to profile:', post.author.username);
    navigate(`/@${post.author.username}`);
  };

  return (
    <div 
      className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4 cursor-pointer hover:bg-accent/5 transition-colors duration-200"
      onClick={handlePostClick}
    >
      <div onClick={handleUsernameClick}>
        <PostHeader author={post.author} timestamp={post.timestamp} />
      </div>
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
        onAction={(action: 'like' | 'bookmark' | 'delete' | 'repost') => {
          if (action === 'delete') {
            handleDelete();
          } else {
            onPostAction(post.id, action);
          }
        }}
      />
    </div>
  );
};