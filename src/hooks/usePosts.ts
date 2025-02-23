
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

interface UserSubscription {
  status: string;
  subscription_tiers: {
    name: string;
    checkmark_color: string;
  };
}

export const usePosts = (followingOnly: boolean = false) => {
  const session = useSession();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', followingOnly],
    queryFn: async () => {
      console.log('Fetching posts with followingOnly:', followingOnly);
      
      try {
        // Calculate the date 3 days ago
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles!inner (
              id,
              username,
              avatar_url,
              user_subscriptions (
                status,
                subscription_tiers (
                  name,
                  checkmark_color
                )
              )
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
          .gt('created_at', threeDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        // If followingOnly is true and user is logged in, first get following IDs
        if (followingOnly && session?.user?.id) {
          const { data: followingData, error: followingError } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', session.user.id);

          if (followingError) {
            console.error('Error fetching following:', followingError);
            throw followingError;
          }

          const followingIds = followingData?.map(f => f.following_id) || [];
          query = query.in('user_id', followingIds);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching posts:', error);
          throw error;
        }

        // Filter out posts with missing profiles and map the data
        const validPosts = data?.filter(post => post.profiles).map(post => {
          // Ensure user_subscriptions is treated as an array
          const subscriptions = Array.isArray(post.profiles.user_subscriptions) 
            ? post.profiles.user_subscriptions 
            : [];
            
          const activeSubscription = subscriptions.find(
            (sub: UserSubscription) => sub?.status === 'active'
          );

          // Calculate the actual number of likes
          const likeCount = post.post_likes ? post.post_likes.length : 0;

          return {
            ...post,
            author: {
              id: post.profiles.id,
              username: post.profiles.username || 'Deleted User',
              avatar_url: post.profiles.avatar_url,
              name: post.profiles.username || 'Deleted User',
              subscription: activeSubscription?.subscription_tiers || null
            },
            likes: likeCount
          };
        });

        console.log(`Successfully fetched ${validPosts?.length} posts:`, validPosts);
        return validPosts;
      } catch (error) {
        console.error('Query error:', error);
        toast.error('Failed to load posts');
        throw error;
      }
    },
    staleTime: 1000 * 30, // Data stays fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep unused data for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return { 
    posts, 
    isLoading,
    error,
  };
};
