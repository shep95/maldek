import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostDetailHeader } from "@/components/dashboard/post/detail/PostDetailHeader";
import { PostDetailContent } from "@/components/dashboard/post/detail/PostDetailContent";
import { CommentSection } from "@/components/dashboard/post/detail/CommentSection";

const PostDetail = () => {
  const { postId } = useParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState<string>('en');
  const queryClient = useQueryClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (user?.id) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('preferred_language')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setUserLanguage(data.preferred_language);
        }
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!postId) return;

    console.log('Subscribing to comments for post:', postId);
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          console.log('Received comment update:', payload);
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from comments channel');
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      console.log('Fetching post details:', postId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        throw error;
      }

      console.log('Post details fetched:', data);
      return {
        ...data,
        isLiked: false,
        isBookmarked: false,
        timestamp: new Date(data.created_at),
        mediaUrls: data.media_urls || []
      };
    },
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      console.log('Fetching comments for post:', postId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, avatar_url)
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
  });

  if (isLoadingPost || isLoadingComments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">Post not found</h2>
        <PostDetailHeader />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <PostDetailHeader />
      
      <PostDetailContent
        post={post}
        currentUserId={currentUserId || ''}
        onPostAction={() => {}}
      />

      <CommentSection
        postId={post.id}
        postAuthorId={post.author.id}
        currentUserId={currentUserId}
        comments={comments}
        userLanguage={userLanguage}
        onCommentAdded={() => queryClient.invalidateQueries({ queryKey: ['comments', postId] })}
      />
    </div>
  );
};

export default PostDetail;