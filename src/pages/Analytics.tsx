import { Card } from "@/components/ui/card";
import { AnalyticsTab } from "@/components/profile/tabs/AnalyticsTab";

const Analytics = () => {
  return (
    <div className="animate-fade-in py-4">
      <Card className="border-none bg-transparent shadow-none">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <AnalyticsTab />
      </Card>
    </div>
  );
};

export default Analytics;