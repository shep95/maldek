import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsChart } from "./AnalyticsChart";
import { AnalyticsCard } from "./AnalyticsCard";
import { Users, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export const AppAnalyticsCard = () => {
  const { data: appAnalytics, isLoading } = useQuery({
    queryKey: ['app-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);

      if (error) {
        console.error('Error fetching app analytics:', error);
        throw error;
      }

      return data;
    },
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  if (isLoading || !appAnalytics) {
    return null;
  }

  const latestData = appAnalytics[0];
  const chartData = appAnalytics.map(day => ({
    date: format(new Date(day.date), 'MMM dd'),
    activeUsers: day.active_users_count,
    newSignups: day.new_signups_count
  })).reverse();

  const peakHourFormatted = latestData.peak_hour != null 
    ? `${latestData.peak_hour}:00 - ${latestData.peak_hour + 1}:00`
    : 'N/A';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">App Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalyticsCard
          title="Active Users"
          value={latestData.active_users_count}
          icon={Users}
          trend="Last 15 minutes"
        />
        <AnalyticsCard
          title="New Signups Today"
          value={latestData.new_signups_count}
          icon={TrendingUp}
          trend="Today's total"
        />
        <AnalyticsCard
          title="Peak Activity Hour"
          value={peakHourFormatted}
          icon={Clock}
          trend="Most active time"
        />
      </div>

      <Card className="p-6 bg-black/20 backdrop-blur border-accent/20">
        <h3 className="text-xl font-semibold mb-6">7-Day Activity</h3>
        <div className="h-[400px]">
          <AnalyticsChart 
            data={chartData}
          />
        </div>
      </Card>
    </div>
  );
};