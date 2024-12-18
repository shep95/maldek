import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsCard } from "@/components/profile/tabs/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/profile/tabs/analytics/AnalyticsChart";
import { useAnalytics } from "@/components/profile/tabs/analytics/useAnalytics";

const Analytics = () => {
  const session = useSession();
  const { data: analytics, isLoading } = useAnalytics(session?.user?.id || '');

  if (!session?.user?.id) {
    return <div>Please log in to view analytics.</div>;
  }

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard 
          title="Total Views" 
          value={analytics?.reduce((sum, day) => sum + day.views, 0) || 0}
          trend={"+10%"}
        />
        <AnalyticsCard 
          title="Total Likes" 
          value={analytics?.reduce((sum, day) => sum + day.likes, 0) || 0}
          trend={"+5%"}
        />
        <AnalyticsCard 
          title="Total Comments" 
          value={analytics?.reduce((sum, day) => sum + day.comments, 0) || 0}
          trend={"+15%"}
        />
        <AnalyticsCard 
          title="Watch Time (mins)" 
          value={analytics?.reduce((sum, day) => sum + day.watchTime, 0) || 0}
          trend={"+20%"}
        />
      </div>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Performance Over Time</h2>
        <AnalyticsChart data={analytics || []} />
      </Card>
    </div>
  );
};

export default Analytics;