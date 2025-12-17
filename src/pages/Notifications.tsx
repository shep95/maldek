
import { useState, useEffect } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationFilters } from "@/components/notifications/filters/NotificationFilters";
import { NotificationPreferences } from "@/components/notifications/preferences/NotificationPreferences";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Notifications = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { notifications, isLoading } = useNotifications(currentUserId);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: { from: undefined, to: undefined },
    search: "",
  });

  // Fetch current user ID only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id && isMounted) {
          console.log("Current user ID set:", user.id);
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
    return () => { isMounted = false; };
  }, []);

  // Filter notifications based on current filters
  const filteredNotifications = notifications?.filter(notification => {
    if (filters.type !== "all" && notification.type !== filters.type) return false;
    
    if (filters.dateRange.from || filters.dateRange.to) {
      const notificationDate = new Date(notification.created_at);
      if (filters.dateRange.from && notificationDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && notificationDate > filters.dateRange.to) return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const actorName = notification.actor.username.toLowerCase();
      return actorName.includes(searchLower);
    }
    
    return true;
  });

  const unreadNotifications = filteredNotifications?.filter(n => !n.read) || [];
  const archivedNotifications = filteredNotifications?.filter(n => n.archived) || [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Notifications
        </h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with interactions on your content
        </p>
      </div>

      <NotificationFilters onFilterChange={setFilters} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6 bg-card/50 backdrop-blur-sm border border-border/30 p-1 rounded-xl">
          <TabsTrigger 
            value="all" 
            className="flex-1 rounded-lg data-[state=active]:bg-accent/15 data-[state=active]:text-accent transition-all"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            className="flex-1 rounded-lg data-[state=active]:bg-accent/15 data-[state=active]:text-accent transition-all"
          >
            Unread {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
          </TabsTrigger>
          <TabsTrigger 
            value="archived" 
            className="flex-1 rounded-lg data-[state=active]:bg-accent/15 data-[state=active]:text-accent transition-all"
          >
            Archived
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="flex-1 rounded-lg data-[state=active]:bg-accent/15 data-[state=active]:text-accent transition-all"
          >
            Preferences
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <NotificationList
            notifications={filteredNotifications || []}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="unread">
          <NotificationList
            notifications={unreadNotifications}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="archived">
          <NotificationList
            notifications={archivedNotifications}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
