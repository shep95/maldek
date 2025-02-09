
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const POSTS_PER_PAGE = 10; // Reasonable batch size for mobile

export const usePosts = (page: number = 1) => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', page],
    queryFn: async () => {
      console.log(`Fetching posts page ${page}...`);
      const start = (page - 1) * POSTS_PER_PAGE;
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            media_urls,
            created_at,
            profiles (
              id,
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .range(start, start + POSTS_PER_PAGE - 1)
          .limit(POSTS_PER_PAGE);

        if (error) {
          console.error('Error fetching posts:', error);
          throw error;
        }

        console.log(`Successfully fetched ${data?.length} posts for page ${page}`);
        return data;
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
    hasMore: posts?.length === POSTS_PER_PAGE
  };
};
