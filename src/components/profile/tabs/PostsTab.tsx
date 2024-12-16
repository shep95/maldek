import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/dashboard/PostCard";
import { useSession } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PostsTabProps {
  userId: string;
}

export const PostsTab = ({ userId }: PostsTabProps) => {
  const session = useSession();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['profile-posts', userId],
    queryFn: async () => {
      console.log('Fetching posts for user:', userId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        // Don't throw error for new users with no posts
        if (error.code === 'PGRST116') {
          return [];
        }
        throw error;
      }
      console.log('Fetched posts:', data);
      return data;
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000)
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4">
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

  return posts && posts.length > 0 ? (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={{
            ...post,
            author: {
              id: post.profiles.id,
              username: post.profiles.username,
              avatar_url: post.profiles.avatar_url,
              name: post.profiles.username
            },
            timestamp: new Date(post.created_at),
            comments: post.comments?.length || 0,
            isLiked: post.post_likes?.some(like => like.user_id === session?.user?.id) || false,
            isBookmarked: post.bookmarks?.some(bookmark => bookmark.user_id === session?.user?.id) || false
          }}
          currentUserId={session?.user?.id || ''}
          onPostAction={() => {}}
          onMediaClick={() => {}}
        />
      ))}
    </div>
  ) : (
    <div className="p-4 text-center text-muted-foreground">
      <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
        No posts yet
      </div>
    </div>
  );
};