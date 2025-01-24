import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostDetailHeader } from "@/components/dashboard/post/detail/PostDetailHeader";
import { PostDetailContent } from "@/components/dashboard/post/detail/PostDetailContent";
import { CommentSection } from "@/components/dashboard/post/detail/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data: post, isLoading: isLoadingPost, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      console.log('Fetching post details for:', postId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:profiles (
            id,
            username,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          ),
          bookmarks (
            id,
            user_id
          ),
          comments (
            id
          )
        `)
        .eq('id', postId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching post:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Post not found');
      }
      
      return {
        ...data,
        author: {
          id: data.profiles.id,
          username: data.profiles.username,
          avatar_url: data.profiles.avatar_url,
          name: data.profiles.username
        },
        isLiked: data.post_likes?.some(like => like.user_id === currentUserId) || false,
        isBookmarked: data.bookmarks?.some(bookmark => bookmark.user_id === currentUserId) || false,
        timestamp: new Date(data.created_at),
        mediaUrls: data.media_urls || []
      };
    },
    retry: 1,
    staleTime: 1000 * 60 // Data stays fresh for 1 minute
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
      return data;
    },
    enabled: !!post // Only fetch comments if post exists
  });

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <PostDetailHeader />
        <div className="mt-8 p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-muted">
          <h2 className="text-xl font-semibold text-foreground">Post not found</h2>
          <p className="text-muted-foreground mt-2">
            This post may have been deleted or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingPost) {
    return (
      <div className="max-w-3xl mx-auto p-4 animate-in fade-in-50">
        <PostDetailHeader />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <PostDetailHeader />
        <div className="mt-8 p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-muted">
          <h2 className="text-xl font-semibold text-foreground">Post not found</h2>
          <p className="text-muted-foreground mt-2">
            This post may have been deleted or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in-50">
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