import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

const Notifications = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { notifications } = useNotifications(currentUserId);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar setIsCreatingPost={() => {}} />
      
      <main className="flex-1 p-4 md:ml-72 lg:mr-96 md:p-8 pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-8">Notifications</h1>
          <NotificationList notifications={notifications} />
        </div>
      </main>

      <RightSidebar />
      <MobileNav />
    </div>
  );
};

export default Notifications;