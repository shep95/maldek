import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationCount = (userId: string | null) => {
  // Fetch unread notifications count
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications-count', userId],
    queryFn: async () => {
      try {
        if (!userId) return 0;

        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('read', false)
          .is('deleted_at', null)
          .is('archived', false);

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching notification count:', error);
        return 0;
      }
    },
    enabled: !!userId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 60000 // Keep data in cache for 1 minute
  });

  return unreadCount || 0;
};