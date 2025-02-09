
import { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/usePosts";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

export const PostList = () => {
  const [page, setPage] = useState(1);
  const { ref: loadMoreRef, inView } = useInView();
  const session = useSession();
  const queryClient = useQueryClient();
  const { posts, isLoading, hasMore } = usePosts(page);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [postStats, setPostStats] = useState<Record<string, { likes: number, isLiked: boolean, comments: number }>>({});
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  // Load more posts when scrolling to bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, isLoading]);

  useEffect(() => {
    const fetchPostStats = async () => {
      if (!posts?.length) return;
      
      console.log('Fetching post stats in batch...');
      
      try {
        const postIds = posts.map(p => p.id);
        
        // Get likes in a single query with retry logic
        let likesData = null;
        let likesError = null;
        let attempts = 0;

        while (!likesData && attempts < MAX_RETRIES) {
          try {
            const { data, error } = await supabase
              .from('post_likes')
              .select('post_id, user_id')
              .in('post_id', postIds);

            if (error) throw error;
            likesData = data;
          } catch (error) {
            console.error(`Attempt ${attempts + 1} failed:`, error);
            likesError = error;
            attempts++;
            if (attempts < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
          }
        }

        if (likesError && !likesData) throw likesError;

        // Get comments count with retry logic
        let commentsData = null;
        let commentsError = null;
        attempts = 0;

        while (!commentsData && attempts < MAX_RETRIES) {
          try {
            const { data, error } = await supabase
              .from('comments')
              .select('post_id')
              .in('post_id', postIds);

            if (error) throw error;
            commentsData = data;
          } catch (error) {
            console.error(`Attempt ${attempts + 1} failed:`, error);
            commentsError = error;
            attempts++;
            if (attempts < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
          }
        }

        if (commentsError && !commentsData) throw commentsError;

        // Process the results
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

        console.log('Post stats fetched successfully:', stats);
        setPostStats(prev => ({ ...prev, ...stats }));
        setRetryCount(0);
      } catch (error) {
        console.error('Error fetching post stats:', error);
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          toast.error("Having trouble loading some data. Retrying...");
          setTimeout(fetchPostStats, RETRY_DELAY);
        } else {
          toast.error("Unable to load complete post data. Please refresh the page.");
        }
      }
    };

    fetchPostStats();

    // Set up a single real-time subscription for all posts
    console.log('Setting up real-time subscription for posts, likes and comments');
    
    const channel = supabase.channel('post-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['posts'] });
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
          console.log('Like update received, refreshing stats');
          fetchPostStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        () => {
          console.log('Comment update received, refreshing stats');
          fetchPostStats();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };

  }, [posts, session?.user?.id, queryClient, retryCount]);

  const handlePostAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    if (action === 'delete') {
      try {
        console.log('Attempting to delete post:', postId);
        
        if (session?.user?.email !== 'killerbattleasher@gmail.com') {
          console.error('Unauthorized deletion attempt');
          toast.error('Only administrators can delete posts');
          return;
        }

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
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    }
  };

  if (isLoading && page === 1) {
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

  return (
    <>
      <MediaPreviewDialog
        selectedMedia={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      <div className="space-y-6">
        {posts && posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  user_id: post.profiles.id,
                  author: {
                    id: post.profiles.id,
                    username: post.profiles.username,
                    avatar_url: post.profiles.avatar_url,
                    name: post.profiles.username
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
            
            {/* Load more trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-4 flex justify-center">
                <Button disabled variant="ghost" size="sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading more posts...
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-xl border border-muted/50">
            <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to share something with your network!
            </p>
          </div>
        )}
      </div>
    </>
  );
};
