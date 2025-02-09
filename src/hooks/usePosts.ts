
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const POSTS_PER_PAGE = 10; // Initial load of 10 posts
const POSTS_PER_SCROLL = 1; // Load 1 post at a time when scrolling

export const usePosts = (page: number = 1) => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', page],
    queryFn: async () => {
      console.log(`Fetching posts page ${page}...`);
      
      // For first page, load POSTS_PER_PAGE items
      // For subsequent pages, load POSTS_PER_SCROLL items
      const pageSize = page === 1 ? POSTS_PER_PAGE : POSTS_PER_SCROLL;
      const start = page === 1 
        ? 0 
        : POSTS_PER_PAGE + ((page - 2) * POSTS_PER_SCROLL);
      
      try {
        // Calculate the date 3 days ago
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
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
          .gt('created_at', threeDaysAgo.toISOString()) // Only fetch posts newer than 3 days
          .order('created_at', { ascending: false })
          .range(start, start + pageSize - 1)
          .limit(pageSize);

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
    hasMore: posts?.length === (page === 1 ? POSTS_PER_PAGE : POSTS_PER_SCROLL)
  };
};
