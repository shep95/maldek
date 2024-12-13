import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/dashboard/PostCard";
import { useSession } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RepliesTabProps {
  userId: string;
}

export const RepliesTab = ({ userId }: RepliesTabProps) => {
  const session = useSession();

  const { data: replies, isLoading } = useQuery({
    queryKey: ['profile-replies', userId],
    queryFn: async () => {
      console.log('Fetching replies for user:', userId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
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
        console.error('Error fetching replies:', error);
        throw error;
      }
      console.log('Fetched replies:', data);
      return data;
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4">
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

  return replies && replies.length > 0 ? (
    <div className="space-y-6">
      {replies.map((reply) => (
        <div key={reply.id} className="p-4 rounded-lg border border-muted">
          <p className="text-muted-foreground mb-2 text-sm">Replied to:</p>
          {reply.posts && (
            <PostCard
              post={{
                ...reply.posts,
                author: {
                  id: reply.posts.profiles.id,
                  username: reply.posts.profiles.username,
                  avatar_url: reply.posts.profiles.avatar_url,
                  name: reply.posts.profiles.username
                },
                timestamp: new Date(reply.posts.created_at),
                comments: 0,
                isLiked: false,
                isBookmarked: false
              }}
              currentUserId={session?.user?.id || ''}
              onPostAction={() => {}}
              onMediaClick={() => {}}
            />
          )}
          <div className="mt-2 p-4 bg-accent/5 rounded">
            <p className="text-sm">{reply.content}</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="p-4 text-center text-muted-foreground">
      <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
        No replies yet
      </div>
    </div>
  );
};