import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useNotificationCount = (userId: string | null) => {
  const queryClient = useQueryClient();

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
    staleTime: 30000,
    gcTime: 60000
  });

  // Subscribe to realtime changes for accurate count
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notification-count-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        () => {
          // Refetch count when notifications change
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'unread-notifications-count'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return unreadCount || 0;
};