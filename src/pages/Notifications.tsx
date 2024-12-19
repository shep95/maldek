import { useState, useEffect } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationFilters } from "@/components/notifications/filters/NotificationFilters";
import { NotificationPreferences } from "@/components/notifications/preferences/NotificationPreferences";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Notifications = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { notifications, isLoading } = useNotifications(currentUserId);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: { from: undefined, to: undefined },
    search: "",
  });
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  // Only mark notifications as read once when the component mounts
  useEffect(() => {
    const markNotificationsAsRead = async () => {
      if (!currentUserId || hasMarkedAsRead || isLoading) return;

      try {
        console.log('Marking notifications as read for user:', currentUserId);
        
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('recipient_id', currentUserId)
          .eq('read', false);

        if (error) {
          console.error('Error marking notifications as read:', error);
          toast.error('Failed to mark notifications as read');
        } else {
          console.log('Successfully marked notifications as read');
          setHasMarkedAsRead(true);
          // Invalidate the notifications query to refresh the list
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        }
      } catch (error) {
        console.error('Error in markNotificationsAsRead:', error);
      }
    };

    markNotificationsAsRead();
  }, [currentUserId, hasMarkedAsRead, isLoading, queryClient]);

  const handleBulkAction = async (action: 'read' | 'archive' | 'delete', ids: string[]) => {
    if (!currentUserId || ids.length === 0) return;

    try {
      let updateData = {};
      switch (action) {
        case 'read':
          updateData = { read: true };
          break;
        case 'archive':
          updateData = { archived: true };
          break;
        case 'delete':
          updateData = { deleted_at: new Date().toISOString() };
          break;
      }

      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .in('id', ids)
        .eq('recipient_id', currentUserId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });

      toast.success(`Successfully ${action === 'read' ? 'marked as read' : action + 'd'} ${ids.length} notifications`);
    } catch (error) {
      console.error(`Error performing bulk action ${action}:`, error);
      toast.error(`Failed to ${action} notifications`);
    }
  };

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
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with interactions on your content
        </p>
      </div>

      <NotificationFilters onFilterChange={setFilters} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            Unread {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex-1">
            Archived
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex-1">
            Preferences
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <NotificationList
            notifications={filteredNotifications || []}
            isLoading={isLoading}
            onBulkAction={handleBulkAction}
          />
        </TabsContent>
        
        <TabsContent value="unread">
          <NotificationList
            notifications={unreadNotifications}
            isLoading={isLoading}
            onBulkAction={handleBulkAction}
          />
        </TabsContent>

        <TabsContent value="archived">
          <NotificationList
            notifications={archivedNotifications}
            isLoading={isLoading}
            onBulkAction={handleBulkAction}
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