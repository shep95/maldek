import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/dashboard/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const CommunityDetail = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { data: session } = useSession();

  const { data: community, isLoading: isLoadingCommunity } = useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      if (!communityId) throw new Error('No community ID provided');

      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          creator:profiles!communities_creator_id_fkey(username, avatar_url),
          members:community_members(count)
        `)
        .eq('id', communityId)
        .single();

      if (error) {
        console.error('Error fetching community:', error);
        throw error;
      }

      return data;
    }
  });

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['community-posts', communityId],
    queryFn: async () => {
      if (!communityId) throw new Error('No community ID provided');

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching community posts:', error);
        throw error;
      }

      return data;
    }
  });

  const handlePostAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        toast.success('Post deleted successfully');
      }
      // Refetch posts after action
      queryClient.invalidateQueries(['community-posts', communityId]);
    } catch (error) {
      console.error('Error handling post action:', error);
      toast.error('Failed to perform action');
    }
  };

  if (isLoadingCommunity) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">Community not found</h2>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl p-4 mx-auto">
      <div className="mb-6">
        <div className="relative">
          {community.banner_url ? (
            <img
              src={community.banner_url}
              alt={community.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg" />
          )}
          <Avatar className="absolute -bottom-6 left-6 w-24 h-24 border-4 border-background">
            <AvatarImage src={community.avatar_url} />
            <AvatarFallback>
              <Users className="w-12 h-12" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-8 ml-2">
          <h1 className="text-3xl font-bold">{community.name}</h1>
          <p className="text-muted-foreground mt-2">{community.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {community.members?.[0]?.count || 0} members
          </p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-4">
          {isLoadingPosts ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))
          ) : posts?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground">Be the first to post in this community!</p>
            </div>
          ) : (
            posts?.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={session?.user?.id || ''}
                onPostAction={handlePostAction}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CommunityDetail;