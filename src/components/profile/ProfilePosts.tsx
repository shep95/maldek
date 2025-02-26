
import { PostCard } from "../dashboard/PostCard";
import { useSession } from '@supabase/auth-helpers-react';
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ProfilePostsProps {
  posts: any[];
  isLoading: boolean;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
}

export const ProfilePosts = ({ posts, isLoading, onPostAction }: ProfilePostsProps) => {
  const session = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to real-time updates for posts
    const channel = supabase
      .channel('profile-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          console.log('Posts updated, invalidating query');
          queryClient.invalidateQueries({ queryKey: ['user-posts'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        () => {
          console.log('Post likes updated');
          queryClient.invalidateQueries({ queryKey: ['user-posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
            <div className="h-24 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {posts?.map((post) => {
        // Calculate correct counts from the nested data
        const likeCount = post.post_likes?.length || 0;
        const commentCount = post.comments?.length || 0;
        const isLiked = post.post_likes?.some(like => like.user_id === session?.user?.id) || false;

        return (
          <PostCard
            key={post.id}
            post={{
              ...post,
              author: {
                id: post.profiles.id,
                username: post.profiles.username,
                avatar_url: post.profiles.avatar_url,
                name: post.profiles.username,
                subscription: post.profiles.user_subscriptions?.[0]?.subscription_tiers
              },
              timestamp: new Date(post.created_at),
              likes: likeCount,
              comments: commentCount,
              reposts: post.reposts || 0,
              isLiked,
              isBookmarked: post.bookmarks?.some(bookmark => bookmark.user_id === session?.user?.id) || false
            }}
            currentUserId={session?.user?.id || ''}
            onPostAction={onPostAction}
            onMediaClick={() => {}}
          />
        );
      })}

      {posts?.length === 0 && (
        <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-lg border border-muted">
          <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
          <p className="text-muted-foreground">
            When you create posts, they'll show up here
          </p>
        </div>
      )}
    </div>
  );
};
