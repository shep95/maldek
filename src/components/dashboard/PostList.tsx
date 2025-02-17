
import React, { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/usePosts";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { CheckCircle2, Users } from "lucide-react";

export const PostList = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const [followingOnly, setFollowingOnly] = useState(false);
  const { posts, isLoading } = usePosts(followingOnly);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [postStats, setPostStats] = useState<Record<string, { likes: number, isLiked: boolean, comments: number }>>({});
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  React.useEffect(() => {
    const fetchPostStats = async () => {
      if (!posts?.length) return;
      
      console.log('Fetching post stats in batch...');
      
      try {
        const postIds = posts.map(p => p.id);
        
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

  if (isLoading) {
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
        {/* Desktop filter bar */}
        <div className="hidden md:block sticky top-0 z-50 rounded-xl pt-6 mb-6">
          <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg p-1.5">
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setFollowingOnly(false)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-colors border-2 ${
                  !followingOnly 
                    ? 'bg-accent text-accent-foreground border-transparent' 
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
                    ? 'bg-accent text-accent-foreground border-transparent' 
                    : 'text-muted-foreground border-border hover:border-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Following</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile filter options */}
        <div className="md:hidden mb-6">
          <div className="flex justify-center items-center gap-2 p-3 bg-background/60 backdrop-blur-xl border border-border/50 rounded-lg shadow-lg">
            <button
              onClick={() => setFollowingOnly(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors border-2 ${
                !followingOnly 
                  ? 'bg-accent text-accent-foreground border-transparent' 
                  : 'text-muted-foreground border-border hover:border-foreground'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>All Posts</span>
            </button>
            <button
              onClick={() => setFollowingOnly(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors border-2 ${
                followingOnly 
                  ? 'bg-accent text-accent-foreground border-transparent' 
                  : 'text-muted-foreground border-border hover:border-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Following</span>
            </button>
          </div>
        </div>

        <div className="md:pt-6">
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
          ) : !isLoading ? (
            <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-xl border border-muted/50">
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                {followingOnly 
                  ? "Follow some users to see their posts here!"
                  : "Be the first to share something with your network!"
                }
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};
