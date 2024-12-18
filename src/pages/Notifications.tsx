import { useState, useEffect } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Notifications = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { notifications, isLoading } = useNotifications(currentUserId);
  const queryClient = useQueryClient();

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

  // Add effect to mark notifications as read when the component mounts
  useEffect(() => {
    const markNotificationsAsRead = async () => {
      if (!currentUserId) return;

      try {
        console.log('Marking notifications as read for user:', currentUserId);
        
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('recipient_id', currentUserId)
          .eq('read', false);

        if (error) {
          console.error('Error marking notifications as read:', error);
        } else {
          console.log('Successfully marked notifications as read');
          // Invalidate the unread notifications count query to trigger a refetch
          queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        }
      } catch (error) {
        console.error('Error in markNotificationsAsRead:', error);
      }
    };

    markNotificationsAsRead();
  }, [currentUserId, queryClient]);

  const allNotifications = notifications || [];
  const unreadNotifications = allNotifications.filter(n => !n.read);
  const readNotifications = allNotifications.filter(n => n.read);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with interactions on your content
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            Unread {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <NotificationList notifications={allNotifications} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="unread">
          <NotificationList notifications={unreadNotifications} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;