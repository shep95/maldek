
import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";
import { Eye, ThumbsUp, MessageSquare, Clock } from "lucide-react";
import { AnalyticsCard } from "@/components/profile/tabs/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/profile/tabs/analytics/AnalyticsChart";
import { useAnalytics } from "@/components/profile/tabs/analytics/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PremiumFeatureNotice } from "@/components/ai/components/PremiumFeatureNotice";

const Analytics = () => {
  const session = useSession();

  // Check if user has an active subscription
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, tier:subscription_tiers(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: analytics, isLoading } = useAnalytics(session?.user?.id || '');

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-lg text-gray-400">Please log in to view analytics.</p>
      </div>
    );
  }

  // Updated to allow Creator tier ($3.50) to access analytics
  const hasAnalyticsAccess = subscription?.tier?.name === 'Creator' || 
                            subscription?.tier?.name === 'Business' || 
                            subscription?.tier?.name === 'True Emperor';

  // Show premium notice if user doesn't have an active subscription or proper tier
  if (!hasAnalyticsAccess) {
    return <PremiumFeatureNotice />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    );
  }

  const calculateTrend = (metric: string) => {
    if (!analytics || analytics.length < 2) return "+0%";
    const current = analytics[analytics.length - 1][metric as keyof typeof analytics[0]] as number;
    const previous = analytics[analytics.length - 2][metric as keyof typeof analytics[0]] as number;
    if (previous === 0) return "+0%";
    const trend = ((current - previous) / previous) * 100;
    return `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard 
          title="Total Views" 
          value={analytics?.reduce((sum, day) => sum + day.views, 0) || 0}
          trend={calculateTrend('views')}
          icon={Eye}
        />
        <AnalyticsCard 
          title="Total Likes" 
          value={analytics?.reduce((sum, day) => sum + day.likes, 0) || 0}
          trend={calculateTrend('likes')}
          icon={ThumbsUp}
        />
        <AnalyticsCard 
          title="Total Comments" 
          value={analytics?.reduce((sum, day) => sum + day.comments, 0) || 0}
          trend={calculateTrend('comments')}
          icon={MessageSquare}
        />
        <AnalyticsCard 
          title="Watch Time (mins)" 
          value={analytics?.reduce((sum, day) => sum + day.watchTime, 0) || 0}
          trend={calculateTrend('watchTime')}
          icon={Clock}
        />
      </div>

      <AnalyticsChart data={analytics || []} />
    </div>
  );
};

export default Analytics;
