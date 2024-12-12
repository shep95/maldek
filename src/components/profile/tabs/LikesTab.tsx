import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/dashboard/PostCard";
import { useSession } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LikesTabProps {
  userId: string;
}

export const LikesTab = ({ userId }: LikesTabProps) => {
  const session = useSession();

  const { data: likedPosts, isLoading } = useQuery({
    queryKey: ['profile-likes', userId],
    queryFn: async () => {
      console.log('Fetching liked posts for user:', userId);
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          post_id,
          posts (
            *,
            profiles (
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching liked posts:', error);
        throw error;
      }
      console.log('Fetched liked posts:', data);
      return data;
    },
    enabled: !!userId
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

  return likedPosts && likedPosts.length > 0 ? (
    <div className="space-y-6">
      {likedPosts.map((like) => (
        <PostCard
          key={like.post_id}
          post={{
            ...like.posts,
            author: {
              id: like.posts.profiles.id,
              username: like.posts.profiles.username,
              avatar_url: like.posts.profiles.avatar_url,
              name: like.posts.profiles.username
            },
            timestamp: new Date(like.posts.created_at),
            comments: 0,
            isLiked: true,
            isBookmarked: false
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
        No liked posts yet
      </div>
    </div>
  );
};