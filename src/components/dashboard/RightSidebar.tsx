
import { LiveSubscriptionCounts } from "@/components/subscription/LiveSubscriptionCounts";
import { TrendingPosts } from "./sidebar/TrendingPosts";
import { TrendingUsers } from "./sidebar/TrendingUsers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const RightSidebar = () => {
  const { data: trendingPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          engagement_score,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('engagement_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const { data: trendingUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['trending-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, follower_count')
        .order('follower_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  return (
    <aside className="hidden lg:flex lg:flex-col w-80 border-l border-border min-h-screen fixed top-0 right-0 pt-20 pb-8 px-4 space-y-6 overflow-y-auto max-h-screen">
      <LiveSubscriptionCounts />
      <TrendingPosts isLoading={isLoadingPosts} posts={trendingPosts} />
      <TrendingUsers isLoading={isLoadingUsers} users={trendingUsers} />
    </aside>
  );
};
