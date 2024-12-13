import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';
import { Eye, ThumbsUp, MessageCircle, Clock, Activity } from "lucide-react";

interface AnalyticsTabProps {
  userId: string;
}

interface AnalyticsData {
  date: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  watch_time_seconds: number;
}

export const AnalyticsTab = ({ userId }: AnalyticsTabProps) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['profile-analytics', userId],
    queryFn: async () => {
      console.log('Fetching analytics for user:', userId);
      
      // First, get all posts by the user
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id')
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

      // Then get analytics for these posts
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('post_analytics')
        .select(`
          date,
          view_count,
          like_count,
          comment_count,
          watch_time_seconds
        `)
        .in('post_id', postIds)
        .gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError);
        throw analyticsError;
      }

      console.log('Raw analytics data:', analyticsData);

      // Group data by date
      const groupedData = analyticsData.reduce((acc: { [key: string]: AnalyticsData }, curr) => {
        const date = curr.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            view_count: 0,
            like_count: 0,
            comment_count: 0,
            watch_time_seconds: 0
          };
        }
        acc[date].view_count += curr.view_count || 0;
        acc[date].like_count += curr.like_count || 0;
        acc[date].comment_count += curr.comment_count || 0;
        acc[date].watch_time_seconds += curr.watch_time_seconds || 0;
        return acc;
      }, {});

      // Convert to array and format dates
      const processedData = Object.values(groupedData).map(day => ({
        date: format(new Date(day.date), 'MMM dd'),
        views: day.view_count,
        likes: day.like_count,
        comments: day.comment_count,
        watchTime: Math.round(day.watch_time_seconds / 60) // Convert to minutes
      }));

      console.log('Processed analytics data:', processedData);
      return processedData;
    },
    enabled: !!userId,
    refetchInterval: 30000 // Refetch every 30 seconds for live updates
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const getTotals = () => {
    if (!analytics) return { views: 0, likes: 0, comments: 0, watchTime: 0 };
    return analytics.reduce((acc, day) => ({
      views: acc.views + day.views,
      likes: acc.likes + day.likes,
      comments: acc.comments + day.comments,
      watchTime: acc.watchTime + day.watchTime
    }), { views: 0, likes: 0, comments: 0, watchTime: 0 });
  };

  const totals = getTotals();
  const engagementRate = analytics && analytics.length > 0
    ? ((totals.likes + totals.comments) / totals.views * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 p-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-black/20 backdrop-blur border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Views</h3>
          </div>
          <p className="text-3xl font-bold text-accent">{totals.views}</p>
        </Card>

        <Card className="p-4 bg-black/20 backdrop-blur border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Likes</h3>
          </div>
          <p className="text-3xl font-bold text-accent">{totals.likes}</p>
        </Card>

        <Card className="p-4 bg-black/20 backdrop-blur border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Comments</h3>
          </div>
          <p className="text-3xl font-bold text-accent">{totals.comments}</p>
        </Card>

        <Card className="p-4 bg-black/20 backdrop-blur border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Watch Time</h3>
          </div>
          <p className="text-3xl font-bold text-accent">{totals.watchTime}m</p>
        </Card>

        <Card className="p-4 bg-black/20 backdrop-blur border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Engagement</h3>
          </div>
          <p className="text-3xl font-bold text-accent">{engagementRate}%</p>
        </Card>
      </div>

      <Card className="p-6 bg-black/20 backdrop-blur border-accent/20">
        <h3 className="text-xl font-semibold mb-4">7-Day Performance</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid #F97316',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="views" name="Views" fill="#F97316" />
              <Bar dataKey="likes" name="Likes" fill="#22C55E" />
              <Bar dataKey="comments" name="Comments" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};