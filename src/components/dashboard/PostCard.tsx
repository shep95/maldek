import { useNavigate } from "react-router-dom";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { PostMedia } from "./post/PostMedia";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Post } from "@/utils/postUtils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick?: (url: string) => void;
}

export const PostCard = ({ post, currentUserId, onPostAction, onMediaClick }: PostCardProps) => {
  const navigate = useNavigate();
  const { data: userSettings } = useUserSettings();
  const [viewCount, setViewCount] = useState(post.view_count || 0);

  useEffect(() => {
    // Subscribe to view count updates
    console.log('Setting up view count subscription for post:', post.id);
    
    const channel = supabase
      .channel(`post-views-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${post.id}`
        },
        (payload) => {
          console.log('Received view count update:', payload);
          if (payload.new.view_count !== undefined) {
            setViewCount(payload.new.view_count);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up view count subscription');
      supabase.removeChannel(channel);
    };
  }, [post.id]);

  const handlePostClick = async () => {
    console.log('Navigating to post:', post.id);
    
    try {
      // Increment view count using the database function
      const { error } = await supabase.rpc('increment_post_view', {
        post_id: post.id
      });

      if (error) {
        console.error('Error incrementing view count:', error);
      }
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }

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
      <PostHeader 
        author={post.author} 
        timestamp={post.timestamp} 
        onUsernameClick={handleUsernameClick}
      />
      <PostContent 
        content={post.content} 
        userLanguage={userSettings?.preferred_language || 'en'}
        isEditing={false}
      />
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMedia 
          mediaUrls={post.media_urls} 
          onMediaClick={onMediaClick}
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="text-sm">{viewCount} views</span>
        </div>
        <PostActions
          post={post}
          currentUserId={currentUserId}
          onAction={onPostAction}
        />
      </div>
    </div>
  );
};