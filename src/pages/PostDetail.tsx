
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { PostDetailContent } from "@/components/dashboard/post/detail/PostDetailContent";
import { PostDetailHeader } from "@/components/dashboard/post/detail/PostDetailHeader";
import { CommentSection } from "@/components/dashboard/post/detail/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Post } from "@/utils/postUtils";

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const session = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id;

  useEffect(() => {
    if (!postId) {
      console.error('No post ID provided');
      navigate('/');
      return;
    }
  }, [postId, navigate]);

  // Optimized post query with complete data fetching
  const { data: post, isLoading: isLoadingPost, error: postError } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      console.log('Fetching post details for:', postId);
      if (!postId) throw new Error('No post ID provided');

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_likes (
            id,
            user_id
          ),
          comments (
            id
          ),
          profiles!inner (
            id,
            username,
            avatar_url,
            user_subscriptions (
              status,
              subscription_tiers (
                name,
                checkmark_color
              )
            )
          )
        `)
        .eq('id', postId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching post:', error);
        throw error;
      }

      if (!data) {
        console.error('Post not found');
        throw new Error('Post not found');
      }

      console.log('Post data fetched:', data);
      
      // Transform data to match Post type
      const transformedPost: Post = {
        ...data,
        author: {
          id: data.profiles.id,
          username: data.profiles.username,
          avatar_url: data.profiles.avatar_url,
          name: data.profiles.username,
          subscription: data.profiles.user_subscriptions?.[0]?.subscription_tiers
        },
        timestamp: new Date(data.created_at),
        likes: data.post_likes?.length || 0,
        comments: data.comments?.length || 0,
        reposts: data.reposts || 0,
        isLiked: data.post_likes?.some(like => like.user_id === currentUserId) || false,
        isBookmarked: false,
        view_count: data.view_count || 0
      };

      return transformedPost;
    },
    staleTime: 1000 * 30,
    retry: 1
  });

  // Optimized comments query with prefetching
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      console.log('Fetching comments for post:', postId);
      if (!postId) throw new Error('No post ID provided');

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          parent_id,
          gif_url,
          user:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      console.log('Comments fetched:', data);
      return data;
    },
    staleTime: 1000 * 30,
    enabled: !!post
  });

  // Real-time subscription for comments
  useEffect(() => {
    if (!postId) return;

    console.log('Setting up real-time subscription for comments');
    const channel = supabase
      .channel(`post-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Comment update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up post subscriptions');
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const handlePostAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        
        toast.success('Post deleted successfully');
        navigate('/');
      }
      // Handle other actions like like, bookmark, repost here
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  // Show error state if post fetch fails
  if (postError) {
    toast.error("Failed to load post");
    navigate('/');
    return null;
  }

  if (isLoadingPost || !post) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PostDetailHeader />
      
      {post && (
        <PostDetailContent
          post={post}
          currentUserId={currentUserId || ''}
          onPostAction={handlePostAction}
        />
      )}

      <CommentSection
        postId={postId || ''}
        comments={comments || []}
        currentUserId={currentUserId || ''}
      />
    </div>
  );
};

export default PostDetail;
