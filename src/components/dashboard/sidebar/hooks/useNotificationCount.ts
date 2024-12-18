import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useNotificationCount = (userId: string | null) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isNotificationsRoute = location.pathname === "/notifications";

  // Fetch unread notifications count
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications-count', userId],
    queryFn: async () => {
      try {
        if (!userId) return 0;

        // If we're on the notifications route, return 0 immediately
        if (isNotificationsRoute) {
          return 0;
        }

        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('read', false);

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching notification count:', error);
        return 0;
      }
    },
    enabled: !!userId
  });

  // Reset notification count when on notifications page
  useEffect(() => {
    if (isNotificationsRoute) {
      // Set the count to 0 in the cache immediately
      queryClient.setQueryData(['unread-notifications-count', userId], 0);
    }
  }, [isNotificationsRoute, queryClient, userId]);

  return unreadCount || 0;
};