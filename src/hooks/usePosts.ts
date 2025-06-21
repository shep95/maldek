
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
          .order('created_at', { ascending: false })
          .limit(50); // Limit to prevent memory issues with massive datasets

        // If followingOnly is true and user is logged in, first get following IDs
        if (followingOnly && session?.user?.id) {
          const { data: followingData, error: followingError } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', session.user.id)
            .limit(5000); // Reasonable limit for following relationships

          if (followingError) {
            console.error('Error fetching following:', followingError);
            throw followingError;
          }

          const followingIds = followingData?.map(f => f.following_id) || [];
          
          // Handle empty following list gracefully
          if (followingIds.length === 0) {
            return [];
          }
          
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

          // Calculate the actual number of likes with safety checks
          const likeCount = Array.isArray(post.post_likes) ? post.post_likes.length : 0;

          return {
            ...post,
            author: {
              id: post.profiles.id,
              username: post.profiles.username || 'Deleted User',
              avatar_url: post.profiles.avatar_url,
              name: post.profiles.username || 'Deleted User',
              subscription: activeSubscription?.subscription_tiers || null
            },
            likes: Math.max(0, likeCount) // Ensure non-negative
          };
        });

        console.log(`Successfully fetched ${validPosts?.length} posts`);
        return validPosts || [];
      } catch (error) {
        console.error('Query error:', error);
        // Don't show toast for network errors to avoid spam
        if (!error?.message?.includes('Failed to fetch')) {
          toast.error('Failed to load posts');
        }
        throw error;
      }
    },
    staleTime: 1000 * 60, // Increased to 1 minute for better caching
    gcTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
    retry: 2, // Reduced retries to prevent cascade failures
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    // Add circuit breaker pattern
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  });

  return { 
    posts: posts || [], 
    isLoading,
    error,
  };
};
