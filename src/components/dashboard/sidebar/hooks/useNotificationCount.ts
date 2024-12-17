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
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      try {
        if (!userId) return 0;

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
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Reset notification count when on notifications page
  useEffect(() => {
    if (isNotificationsRoute) {
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    }
  }, [isNotificationsRoute, queryClient]);

  return unreadCount || 0;
};