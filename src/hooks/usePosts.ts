import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePosts = () => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('Fetching posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
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
          ),
          quoted_post:posts!quoted_post_id (
            id,
            content,
            created_at,
            media_urls,
            likes,
            reposts,
            user_id,
            profiles (
              id,
              username,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
        throw error;
      }

      console.log('Posts fetched:', data);
      return data;
    },
    refetchInterval: 0 // Disable polling since we're using real-time updates
  });

  return { posts, isLoading };
};