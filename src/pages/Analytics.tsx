
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";
import { Eye, ThumbsUp, MessageSquare, Clock, TrendingUp, Users, Wallet, CircleUser } from "lucide-react";
import { AnalyticsCard } from "@/components/profile/tabs/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/profile/tabs/analytics/AnalyticsChart";
import { useAnalytics } from "@/components/profile/tabs/analytics/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformUsageChart } from "@/components/profile/tabs/analytics/PlatformUsageChart";
import { DemographicChart } from "@/components/profile/tabs/analytics/DemographicChart";
import { MetricRing } from "@/components/profile/tabs/analytics/MetricRing";
import { LiveStatCard } from "@/components/profile/tabs/analytics/LiveStatCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Analytics = () => {
  const session = useSession();
  const isMobile = useIsMobile();
  const { data: analytics, isLoading } = useAnalytics(session?.user?.id || '');

  // Fetch real live stats
  const { data: liveStats } = useQuery({
    queryKey: ['live-stats', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Get real follower count
      const { data: followers } = await supabase
        .from('followers')
        .select('id', { count: 'exact' })
        .eq('following_id', session.user.id);

      // Get real post count
      const { data: posts } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('user_id', session.user.id);

      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('follower_count, total_posts')
        .eq('id', session.user.id)
        .single();

      return {
        followers: profile?.follower_count || 0,
        posts: profile?.total_posts || 0,
        wallets: 0 // This would need to be implemented based on your wallet system
      };
    },
    enabled: !!session?.user?.id,
    refetchInterval: 15000 // Refetch every 15 seconds
  });

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-lg text-gray-400">Please log in to view analytics.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 bg-black/20 backdrop-blur">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <Card className="p-4 bg-black/20 backdrop-blur">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    );
  }

  const calculateTrend = (metric: string) => {
    if (!analytics || analytics.length < 2) return "+0%";
    const current = analytics[analytics.length - 1][metric as keyof typeof analytics[0]] as number;
    const previous = analytics[analytics.length - 2][metric as keyof typeof analytics[0]] as number;
    if (previous === 0) return current > 0 ? "+100%" : "+0%";
    const trend = ((current - previous) / previous) * 100;
    return `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-black text-white py-4 md:py-8 px-3 md:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">
          Bosley Analytics
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
          <div className="lg:col-span-2">
            <Card className="p-4 md:p-6 bg-black/20 backdrop-blur border-accent/20 h-full">
              <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Total Engagement
              </h2>
              <div className="h-[250px] md:h-[350px]">
                <AnalyticsChart data={analytics || []} />
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="p-4 md:p-6 bg-black/20 backdrop-blur border-accent/20 h-full">
              <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Platform Usage</h2>
              <PlatformUsageChart />
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
          <Card className="p-4 md:p-6 bg-black/20 backdrop-blur border-accent/20">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-6">Performance Metrics</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <MetricRing title="User Growth" value={78} />
              <MetricRing title="Post Reach" value={64} />
              <MetricRing title="Bosley Coin Transactions" value={42} />
              <MetricRing title="App Usage" value={91} />
            </div>
          </Card>
          
          <Card className="p-4 md:p-6 bg-black/20 backdrop-blur border-accent/20">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-6">Demographics</h2>
            <DemographicChart />
          </Card>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <LiveStatCard 
            title="Followers" 
            value={liveStats?.followers || 0} 
            icon={CircleUser} 
          />
          <LiveStatCard 
            title="Wallets Connected" 
            value="Coming Soon"
            comingSoon={true}
            icon={Wallet} 
          />
          <LiveStatCard 
            title="Posts Created" 
            value={liveStats?.posts || 0} 
            icon={ThumbsUp} 
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
