
import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/usePosts";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { CheckCircle2, Users } from "lucide-react";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface PostListProps {
  followingOnly: boolean;
  setFollowingOnly: (value: boolean) => void;
}

export const PostList = ({ followingOnly, setFollowingOnly }: PostListProps) => {
  const session = useSession();
  const queryClient = useQueryClient();
  const { posts, isLoading } = usePosts(followingOnly);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [postStats, setPostStats] = useState<Record<string, { likes: number, isLiked: boolean, comments: number }>>({});
  const { blockedUserIds, isLoadingBlocked } = useBlockedUsers();

  // Set up real-time subscriptions for post interactions
  useEffect(() => {
    console.log('Setting up real-time subscriptions for post interactions');
    
    const likesChannel = supabase
      .channel('post-likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        (payload) => {
          console.log('Post likes changed:', payload);
          // Refetch post stats when likes change
          if (posts?.length) {
            fetchPostStats();
          }
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('Comments changed:', payload);
          // Refetch post stats when comments change
          if (posts?.length) {
            fetchPostStats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [posts?.length]);

  const fetchPostStats = async () => {
    if (!posts?.length) return;
    
    console.log('Fetching post stats for', posts.length, 'posts');
    
    try {
      const postIds = posts.map(p => p.id);
      
      // Fetch likes data
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      if (likesError) {
        console.error('Error fetching likes:', likesError);
        throw likesError;
      }

      // Fetch comments data
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        throw commentsError;
      }

      // Build stats object
      const stats: Record<string, { likes: number, isLiked: boolean, comments: number }> = {};
      postIds.forEach(postId => {
        const postLikes = likesData?.filter(l => l.post_id === postId) || [];
        const postComments = commentsData?.filter(c => c.post_id === postId) || [];
        
        stats[postId] = {
          likes: postLikes.length,
          isLiked: postLikes.some(like => like.user_id === session?.user?.id),
          comments: postComments.length
        };
      });

      console.log('Post stats fetched successfully:', Object.keys(stats).length, 'posts');
      setPostStats(stats);
    } catch (error) {
      console.error('Error fetching post stats:', error);
      toast.error("Unable to load post engagement data");
    }
  };

  // Fetch post stats when posts change
  useEffect(() => {
    fetchPostStats();
  }, [posts, session?.user?.id]);

  const handlePostAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    if (action === 'delete') {
      try {
        console.log('Attempting to delete post:', postId);
        
        if (session?.user?.email !== 'killerbattleasher@gmail.com') {
          console.error('Unauthorized deletion attempt');
          toast.error('Only administrators can delete posts');
          return;
        }

        // Optimistically update UI
        queryClient.setQueryData(['posts'], (old: any[]) => 
          old?.filter(post => post.id !== postId)
        );

        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        
        console.log('Post deleted successfully:', postId);
        toast.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
        // Refetch data on error
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    }
  };

  const visiblePosts = posts?.filter(
    (post) => !blockedUserIds.includes(post.author?.id)
  ) || [];

  if (isLoading || isLoadingBlocked) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-muted/50 bg-card/50 backdrop-blur-sm space-y-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  console.log('Rendering PostList with', visiblePosts.length, 'visible posts');

  return (
    <>
      <MediaPreviewDialog
        selectedMedia={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      <div className="space-y-6">
        <div className="hidden md:block sticky top-0 z-50 rounded-xl pt-6 mb-6">
          <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg p-1.5">
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setFollowingOnly(false)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-colors border-2 ${
                  !followingOnly 
                    ? 'border-orange-500 text-orange-500' 
                    : 'text-muted-foreground border-border hover:border-foreground'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">All Posts</span>
              </button>
              <button
                onClick={() => setFollowingOnly(true)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-colors border-2 ${
                  followingOnly 
                    ? 'border-orange-500 text-orange-500' 
                    : 'text-muted-foreground border-border hover:border-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Following</span>
              </button>
            </div>
          </div>
        </div>

        <div className="md:pt-6 space-y-8">
          {visiblePosts && visiblePosts.length > 0 ? (
            <>
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    user_id: post.profiles?.id || post.user_id,
                    author: {
                      id: post.profiles?.id || post.user_id,
                      username: post.profiles?.username || 'Deleted User',
                      avatar_url: post.profiles?.avatar_url,
                      name: post.profiles?.username || 'Deleted User',
                      subscription: post.author?.subscription
                    },
                    timestamp: new Date(post.created_at),
                    likes: postStats[post.id]?.likes || 0,
                    comments: postStats[post.id]?.comments || 0,
                    reposts: 0,
                    isLiked: postStats[post.id]?.isLiked || false,
                    isBookmarked: false
                  }}
                  currentUserId={session?.user?.id || ''}
                  onPostAction={handlePostAction}
                  onMediaClick={setSelectedMedia}
                />
              ))}
              
              <div className="text-center bg-card/50 backdrop-blur-sm rounded-xl border border-muted/50 py-8">
                <div className="flex flex-col items-center gap-2 p-4">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                  <p className="text-foreground font-medium">You're all caught up!</p>
                  <p className="text-muted-foreground text-sm">
                    You've seen all {followingOnly ? "following" : ""} posts from the last three days
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-xl border border-muted/50">
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                {followingOnly 
                  ? "Follow some users to see their posts here!"
                  : "Be the first to share something with your network!"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
