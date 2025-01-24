import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostDetailHeader } from "@/components/dashboard/post/detail/PostDetailHeader";
import { PostDetailContent } from "@/components/dashboard/post/detail/PostDetailContent";
import { CommentSection } from "@/components/dashboard/post/detail/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";

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
  post_likes: { id: string; user_id: string; }[];
  bookmarks: { id: string; user_id: string; }[];
  comments: { id: string; }[];
  // Add transformed properties
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
    name: string;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  timestamp: Date;
  mediaUrls: string[];
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

  // Try to get post from cache first
  const cachedPost = queryClient.getQueryData<PostData>(['post', postId]);

  const { data: post, isLoading: isLoadingPost, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      console.log('Fetching post details for:', postId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          media_urls,
          created_at,
          profiles (
            id,
            username,
            avatar_url
          ),
          (select count(*) from post_likes where post_id = posts.id) as likes_count,
          (select count(*) from bookmarks where post_id = posts.id) as bookmarks_count,
          (select count(*) from comments where post_id = posts.id) as comments_count,
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
        isLiked: data.is_liked,
        isBookmarked: data.is_bookmarked,
        timestamp: new Date(data.created_at),
        mediaUrls: data.media_urls || []
      };
    },
    initialData: cachedPost,
    staleTime: 1000 * 30, // Data stays fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    retry: false,
    refetchOnWindowFocus: false
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
    enabled: !!post,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false
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
