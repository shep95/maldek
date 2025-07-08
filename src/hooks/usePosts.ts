
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { useEffect } from "react";

interface UserSubscription {
  status: string;
  subscription_tiers: {
    name: string;
    checkmark_color: string;
  };
}

export const usePosts = (followingOnly: boolean = false, includeOlderPosts: boolean = false) => {
  const session = useSession();
  const queryClient = useQueryClient();

  // Set up real-time subscription for posts
  useEffect(() => {
    console.log('Setting up real-time subscription for posts');
    
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Posts table changed:', payload);
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', followingOnly, includeOlderPosts, session?.user?.id],
    queryFn: async () => {
      console.log('Fetching posts with followingOnly:', followingOnly);
      
      try {
        // Calculate the date range based on includeOlderPosts
        const daysAgo = includeOlderPosts ? 60 : 30;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
        
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
          .gt('created_at', dateThreshold.toISOString())
          .order('created_at', { ascending: false })
          .limit(50);

        // If followingOnly is true and user is logged in, filter by following
        if (followingOnly && session?.user?.id) {
          const { data: followingData, error: followingError } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', session.user.id)
            .limit(5000);

          if (followingError) {
            console.error('Error fetching following:', followingError);
            throw followingError;
          }

          const followingIds = followingData?.map(f => f.following_id) || [];
          
          if (followingIds.length === 0) {
            console.log('User is not following anyone');
            return [];
          }
          
          query = query.in('user_id', followingIds);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching posts:', error);
          throw error;
        }

        console.log(`Raw posts from database:`, data?.length);

        // Filter out posts with missing profiles and map the data
        const validPosts = data?.filter(post => post.profiles).map(post => {
          const subscriptions = Array.isArray(post.profiles.user_subscriptions) 
            ? post.profiles.user_subscriptions 
            : [];
            
          const activeSubscription = subscriptions.find(
            (sub: UserSubscription) => sub?.status === 'active'
          );

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
            likes: Math.max(0, likeCount)
          };
        });

        console.log(`Successfully fetched ${validPosts?.length} valid posts`);
        return validPosts || [];
      } catch (error) {
        console.error('Query error:', error);
        toast.error('Failed to load posts');
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  });

  return { 
    posts: posts || [], 
    isLoading,
    error,
  };
};
