
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

  // Optimized post query with minimal data fetching
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      console.log('Fetching post details for:', postId);
      if (!postId) throw new Error('No post ID provided');

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          media_urls,
          created_at,
          author:profiles (
            id,
            username,
            avatar_url
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
      
      return {
        ...data,
        author: {
          id: data.author.id,
          username: data.author.username,
          avatar_url: data.author.avatar_url,
          name: data.author.username
        },
        timestamp: new Date(data.created_at),
        likes: 0,
        comments: 0,
        reposts: 0,
        isLiked: false,
        isBookmarked: false,
        view_count: 0
      };
    },
    staleTime: 1000 * 30 // Cache for 30 seconds
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

      // Transform the data to ensure correct structure
      const transformedComments = data.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        parent_id: comment.parent_id,
        gif_url: comment.gif_url,
        user: {
          id: comment.user.id,
          username: comment.user.username,
          avatar_url: comment.user.avatar_url
        },
        replies: []
      }));

      console.log('Comments fetched:', transformedComments);
      return transformedComments;
    },
    staleTime: 1000 * 30 // Cache for 30 seconds
  });

  // Simplified real-time subscription with optimistic updates
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
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData(['comments', postId], (old: any[]) => {
              if (!old) return [payload.new];
              return [...old, payload.new];
            });
          } else {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up post subscriptions');
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

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
      
      <PostDetailContent
        post={post}
        currentUserId={currentUserId || ''}
        onPostAction={handlePostAction}
      />

      <CommentSection
        postId={post.id}
        comments={comments}
        currentUserId={currentUserId || ''}
      />
    </div>
  );
};

export default PostDetail;
