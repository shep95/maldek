import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePosts = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('Fetching posts with minimal data...');
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
        .limit(20); // Limit initial load for better performance

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
        throw error;
      }

      console.log('Posts fetched successfully:', data);
      return data;
    },
    staleTime: 1000 * 30, // Data stays fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep unused data for 5 minutes
  });

  return { posts, isLoading };
};