import { useNavigate } from "react-router-dom";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { PostMedia } from "./post/PostMedia";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Post } from "@/utils/postUtils";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick?: (url: string) => void;
}

export const PostCard = ({ post, currentUserId, onPostAction, onMediaClick }: PostCardProps) => {
  const navigate = useNavigate();
  const { data: userSettings } = useUserSettings();
  const queryClient = useQueryClient();

  const prefetchPostData = async () => {
    console.log('Prefetching post data:', post.id);
    
    // Check if data is already in cache
    const existingData = queryClient.getQueryData(['post', post.id]);
    if (existingData) {
      console.log('Post data already in cache');
      return;
    }

    try {
      // Optimized query with only necessary fields
      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          created_at,
          user_id,
          profiles (
            id,
            username,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          ),
          bookmarks (
            id,
            user_id
          ),
          comments (
            id
          )
        `)
        .eq('id', post.id)
        .single();

      if (data) {
        queryClient.setQueryData(['post', post.id], data);
        console.log('Post data prefetched and cached');
      }
    } catch (err) {
      console.error('Error prefetching post data:', err);
    }
  };

  const handlePostClick = () => {
    console.log('Navigating to post:', post.id);
    navigate(`/post/${post.id}`);
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Navigating to profile:', post.author.username);
    navigate(`/@${post.author.username}`);
  };

  return (
    <div 
      className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4 cursor-pointer hover:bg-accent/5 transition-colors duration-200"
      onClick={handlePostClick}
      onMouseEnter={prefetchPostData}
    >
      <PostHeader 
        author={post.author} 
        timestamp={post.timestamp} 
        onUsernameClick={handleUsernameClick}
      />
      <PostContent 
        content={post.content} 
        userLanguage={userSettings?.preferred_language || 'en'}
        isEditing={false}
        truncate={true}
      />
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMedia 
          mediaUrls={post.media_urls} 
          onMediaClick={onMediaClick}
        />
      )}
      <PostActions
        post={post}
        currentUserId={currentUserId}
        onAction={onPostAction}
      />
    </div>
  );
};