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
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  // Optimize real-time subscription to reduce overhead
  useEffect(() => {
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
        (payload: any) => {
          console.log('Received view count update:', payload);
          if (payload.new && payload.new.view_count !== undefined) {
            setViewCount(payload.new.view_count);
          }
        }
      )
      .subscribe();

    // Remove interval and rely on real-time updates only
    return () => {
      console.log('Cleaning up view count subscription');
      supabase.removeChannel(channel);
    };
  }, [post.id]);

  const prefetchPostData = async () => {
    console.log('Prefetching post data:', post.id);
    
    // Check if data is already in cache
    const existingData = queryClient.getQueryData(['post', post.id]);
    if (existingData) {
      console.log('Post data already in cache');
      return;
    }

    try {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
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

  const handlePostClick = async () => {
    console.log('Navigating to post:', post.id);
    
    try {
      // Increment view count in background
      supabase.rpc('increment_post_view', {
        post_id: post.id
      }).then(({ error }) => {
        if (error) console.error('Error incrementing view count:', error);
      });

      // Navigate immediately without waiting for view count update
      navigate(`/post/${post.id}`);
    } catch (err) {
      console.error('Failed to handle post click:', err);
    }
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
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          {viewCount}
        </span>
        <PostActions
          post={post}
          currentUserId={currentUserId}
          onAction={onPostAction}
        />
      </div>
    </div>
  );
};