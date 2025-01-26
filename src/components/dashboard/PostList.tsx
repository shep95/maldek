import { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/usePosts";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MediaPreviewDialog } from "./MediaPreviewDialog";

export const PostList = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const { posts, isLoading } = usePosts();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [postStats, setPostStats] = useState<Record<string, { likes: number, comments: number }>>({});

  useEffect(() => {
    const fetchPostStats = async () => {
      if (!posts) return;
      
      console.log('Fetching post stats...');
      
      // Get comment counts
      const { data: commentCounts, error: commentError } = await supabase
        .from('comments')
        .select('post_id, count(*)', { count: 'exact' })
        .in('post_id', posts.map(p => p.id))
        .throwOnError();
        
      if (commentError) {
        console.error('Error fetching comment counts:', commentError);
      }

      // Get like counts
      const { data: likeCounts, error: likeError } = await supabase
        .from('post_likes')
        .select('post_id, count(*)', { count: 'exact' })
        .in('post_id', posts.map(p => p.id))
        .throwOnError();
        
      if (likeError) {
        console.error('Error fetching like counts:', likeError);
      }

      // Combine stats
      const stats: Record<string, { likes: number, comments: number }> = {};
      posts.forEach(post => {
        stats[post.id] = {
          likes: likeCounts?.find(l => l.post_id === post.id)?.count || 0,
          comments: commentCounts?.find(c => c.post_id === post.id)?.count || 0
        };
      });

      console.log('Post stats:', stats);
      setPostStats(stats);
    };

    fetchPostStats();
  }, [posts]);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    console.log('Setting up real-time subscriptions for posts');
    
    const channel = supabase
      .channel('post-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post update received:', payload);
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData(['posts'], (old: any[]) => {
              if (!old) return [payload.new];
              return [payload.new, ...old];
            });
          }
          if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [queryClient, session?.user?.id]);

  const handlePostAction = async (postId: string, action: 'delete') => {
    if (action === 'delete') {
      try {
        console.log('Attempting to delete post:', postId);
        console.log('Current user session:', session);
        console.log('Current user email:', session?.user?.email);

        if (session?.user?.email !== 'killerbattleasher@gmail.com') {
          console.error('Unauthorized deletion attempt');
          toast.error('Only administrators can delete posts');
          return;
        }

        queryClient.setQueryData(['posts'], (old: any[]) => 
          old?.filter(post => post.id !== postId)
        );

        const { error, data } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)
          .select();

        console.log('Delete response:', { error, data });

        if (error) {
          console.error('Error deleting post:', error);
          throw error;
        }
        
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
        {posts && posts.length > 0 ? (
          posts.map((post) => (
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
                isLiked: false,
                isBookmarked: false
              }}
              currentUserId={session?.user?.id || ''}
              onPostAction={handlePostAction}
              onMediaClick={setSelectedMedia}
            />
          ))
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
