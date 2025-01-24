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
        const { data } = await supabase
          .from('user_settings')
          .select('preferred_language')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setUserLanguage(data.preferred_language);
        }
      }
    };
    getCurrentUser();
  }, []);

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('id', postId)
        .maybeSingle();

      if (error) throw error;
      
      return data ? {
        ...data,
        isLiked: false,
        isBookmarked: false,
        timestamp: new Date(data.created_at),
        mediaUrls: data.media_urls || []
      } : null;
    },
    staleTime: 1000 * 60 // Data stays fresh for 1 minute
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingPost || isLoadingComments) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
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
        comments={comments || []}
        userLanguage={userLanguage}
        onCommentAdded={() => queryClient.invalidateQueries({ queryKey: ['comments', postId] })}
      />
    </div>
  );
};

export default PostDetail;