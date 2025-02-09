
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

export const usePosts = () => {
  const session = useSession();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', session?.user?.id],
    queryFn: async () => {
      console.log('Fetching posts with continent filtering...');
      
      // First get user's continent preference
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('continent')
        .eq('user_id', session?.user?.id)
        .single();

      if (settingsError) {
        console.error('Error fetching user settings:', settingsError);
        throw settingsError;
      }

      const continent = userSettings?.continent || 'global';
      
      // If global, fetch all posts
      if (continent === 'global') {
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
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
          toast.error('Failed to load posts');
          throw error;
        }

        console.log('Posts fetched successfully:', data);
        return data;
      }

      // If specific continent, fetch posts from users in same continent
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
        .in('user_id', (
          supabase
            .from('user_settings')
            .select('user_id')
            .eq('continent', continent)
        ))
        .order('created_at', { ascending: false });

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
    enabled: !!session?.user?.id,
  });

  return { posts, isLoading };
};
