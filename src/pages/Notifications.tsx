import { useState, useEffect } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const NotificationsSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const Notifications = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { notifications } = useNotifications(currentUserId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
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
        }
      } catch (error) {
        console.error('Error in markNotificationsAsRead:', error);
      }
    };

    markNotificationsAsRead();
  }, [currentUserId]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with interactions on your content
        </p>
      </div>

      {isLoading ? (
        <NotificationsSkeleton />
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
};

export default Notifications;