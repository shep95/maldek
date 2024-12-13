import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ThumbsUp, MessageCircle, Clock, Activity } from "lucide-react";
import { AnalyticsCard } from "./analytics/AnalyticsCard";
import { AnalyticsChart } from "./analytics/AnalyticsChart";
import { useAnalytics } from "./analytics/useAnalytics";

interface AnalyticsTabProps {
  userId: string;
}

export const AnalyticsTab = ({ userId }: AnalyticsTabProps) => {
  const { data: analytics, isLoading } = useAnalytics(userId);

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
  const engagementRate = analytics && analytics.length > 0 && totals.views > 0
    ? ((totals.likes + totals.comments) / totals.views * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 p-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AnalyticsCard title="Views" value={totals.views} icon={Eye} />
        <AnalyticsCard title="Likes" value={totals.likes} icon={ThumbsUp} />
        <AnalyticsCard title="Comments" value={totals.comments} icon={MessageCircle} />
        <AnalyticsCard title="Watch Time" value={`${totals.watchTime}m`} icon={Clock} />
        <AnalyticsCard title="Engagement" value={`${engagementRate}%`} icon={Activity} />
      </div>

      <AnalyticsChart data={analytics || []} />
    </div>
  );
};