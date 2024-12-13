import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from 'date-fns';

export const useAnalytics = (userId: string) => {
  return useQuery({
    queryKey: ['profile-analytics', userId],
    queryFn: async () => {
      console.log('Fetching analytics for user:', userId);
      
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, created_at')
        .eq('user_id', userId);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      if (!posts || posts.length === 0) {
        console.log('No posts found for user');
        return [];
      }

      const postIds = posts.map(post => post.id);
      console.log('Found post IDs:', postIds);

      // Get post likes count
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id, created_at')
        .in('post_id', postIds)
        .gte('created_at', format(subDays(new Date(), 7), 'yyyy-MM-dd'));

      if (likesError) throw likesError;

      // Get post comments count
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('post_id, created_at')
        .in('post_id', postIds)
        .gte('created_at', format(subDays(new Date(), 7), 'yyyy-MM-dd'));

      if (commentsError) throw commentsError;

      // Get views data
      const { data: viewsData, error: viewsError } = await supabase
        .from('post_analytics')
        .select('*')
        .in('post_id', postIds)
        .gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd'));

      if (viewsError) throw viewsError;

      console.log('Raw data:', { views: viewsData, likes: likesData, comments: commentsData });

      // Create last 7 days data structure
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        return {
          date,
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          watch_time_seconds: 0
        };
      }).reverse();

      // Aggregate data by date
      viewsData?.forEach((view) => {
        const dateEntry = dates.find(d => d.date === view.date);
        if (dateEntry) {
          dateEntry.view_count += view.view_count || 0;
          dateEntry.watch_time_seconds += view.watch_time_seconds || 0;
        }
      });

      likesData?.forEach((like) => {
        const date = format(new Date(like.created_at), 'yyyy-MM-dd');
        const dateEntry = dates.find(d => d.date === date);
        if (dateEntry) dateEntry.like_count += 1;
      });

      commentsData?.forEach((comment) => {
        const date = format(new Date(comment.created_at), 'yyyy-MM-dd');
        const dateEntry = dates.find(d => d.date === date);
        if (dateEntry) dateEntry.comment_count += 1;
      });

      return dates.map(day => ({
        date: format(new Date(day.date), 'MMM dd'),
        views: day.view_count,
        likes: day.like_count,
        comments: day.comment_count,
        watchTime: Math.round(day.watch_time_seconds / 60)
      }));
    },
    enabled: !!userId,
    refetchInterval: 5000 // Refetch every 5 seconds
  });
};