import { Card } from "@/components/ui/card";
import { AnalyticsTab } from "@/components/profile/tabs/AnalyticsTab";
import { AdvertisementTab } from "@/components/profile/tabs/AdvertisementTab";
import { useSession } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="advertisements">Advertisements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics">
            <AnalyticsTab userId={session.user.id} />
          </TabsContent>
          
          <TabsContent value="advertisements">
            <AdvertisementTab userId={session.user.id} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Analytics;