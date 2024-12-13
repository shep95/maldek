import { Card } from "@/components/ui/card";
import { AnalyticsTab } from "@/components/profile/tabs/AnalyticsTab";
import { useSession } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";

const Analytics = () => {
  const session = useSession();

  if (!session?.user?.id) {
    console.log("No user session found, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="animate-fade-in py-4">
      <Card className="border-none bg-transparent shadow-none">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <AnalyticsTab userId={session.user.id} />
      </Card>
    </div>
  );
};

export default Analytics;