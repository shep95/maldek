
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePosts = () => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('Fetching all posts from last 3 days...');
      
      try {
        // Calculate the date 3 days ago
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_user_id_fkey (
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
          .gt('created_at', threeDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
          throw error;
        }

        // Filter out posts with missing profiles and map the data
        const validPosts = data?.filter(post => post.profiles).map(post => ({
          ...post,
          author: {
            id: post.profiles.id,
            username: post.profiles.username || 'Deleted User',
            avatar_url: post.profiles.avatar_url,
            name: post.profiles.username || 'Deleted User'
          }
        }));

        console.log(`Successfully fetched ${validPosts?.length} posts`);
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
