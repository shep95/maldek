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

interface PostData {
  id: string;
  content: string;
  user_id: string;
  media_urls: string[];
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  likes: number;
  reposts: number;
  comments: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

interface CommentData {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  user_id: string;
  parent_id: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

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

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      console.log('Fetching post details for:', postId);
      if (!postId) throw new Error('No post ID provided');

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          ),
          (select count(*) from comments where post_id = posts.id) as comments,
          (select exists(select 1 from post_likes where post_id = posts.id and user_id = '${currentUserId}')) as is_liked,
          (select exists(select 1 from bookmarks where post_id = posts.id and user_id = '${currentUserId}')) as is_bookmarked
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
      return data as PostData;
    },
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      console.log('Fetching comments for post:', postId);
      if (!postId) throw new Error('No post ID provided');

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles (
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
      return data as CommentData[];
    },
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!postId) return;

    console.log('Setting up real-time subscriptions for post and comments');
    const channel = supabase
      .channel(`post-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`
        },
        () => {
          console.log('Post update received');
          queryClient.invalidateQueries({ queryKey: ['post', postId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          console.log('Comment update received');
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
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

  const handlePostAction = async (action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (action === 'delete' && post.id) {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', post.id);

        if (error) throw error;
        
        toast.success('Post deleted successfully');
        navigate('/');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PostDetailHeader
        author={{
          id: post.profiles.id,
          username: post.profiles.username,
          avatar_url: post.profiles.avatar_url,
          name: post.profiles.username
        }}
        timestamp={new Date(post.created_at)}
      />
      
      <PostDetailContent
        content={post.content}
        mediaUrls={post.media_urls}
      />

      <CommentSection
        postId={post.id}
        comments={comments || []}
        isLoading={isLoadingComments}
        currentUserId={currentUserId || ''}
      />
    </div>
  );
};

export default PostDetail;