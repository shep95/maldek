
import { useEffect } from 'react';
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CancelAllSubscriptions = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  // This mutation will cancel a subscription
  const cancelSubscription = useMutation({
    mutationFn: async (userId: string) => {
      console.log(`Cancelling subscription for user: ${userId}`);
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          ends_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
      }
      
      return userId;
    },
    onSuccess: (userId) => {
      console.log(`Successfully cancelled subscription for user: ${userId}`);
      // Invalidate ALL related queries to force UI refresh
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error("Failed to cancel subscription");
    }
  });

  // Fetch ALL active subscriptions (not just premium ones)
  const { data: allSubscriptions, isLoading, refetch } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: async () => {
      console.log('Fetching all active subscriptions');
      // This should only be allowed for admins in a real app
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching all subscriptions:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} active subscriptions to cancel`);
      return data || [];
    },
    enabled: !!session?.user?.id,
    staleTime: 0, // Don't cache this query
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });

  // When component mounts, cancel ALL active subscriptions
  useEffect(() => {
    const cancelAllSubscriptions = async () => {
      if (!allSubscriptions || isLoading) return;
      
      console.log("Starting cancellation of ALL subscriptions:", allSubscriptions.length);
      
      let cancelledCount = 0;
      const promises = [];
      
      for (const subscription of allSubscriptions) {
        promises.push(
          cancelSubscription.mutateAsync(subscription.user_id)
            .then(() => {
              cancelledCount++;
              console.log(`Cancelled subscription for user: ${subscription.user_id}`);
            })
            .catch((error) => {
              console.error(`Error cancelling subscription for user ${subscription.user_id}:`, error);
            })
        );
      }
      
      // Wait for all cancellations to complete
      await Promise.all(promises);
      
      if (cancelledCount > 0) {
        toast.success(`Cancelled ${cancelledCount} subscriptions`);
        
        // Force refetch and invalidate all queries to update UI immediately
        refetch();
        
        // Invalidate ALL query keys to ensure UI is completely refreshed
        queryClient.invalidateQueries();
        queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
        queryClient.invalidateQueries({ queryKey: ['all-subscriptions'] });
        
        // Force a page reload to ensure everything is refreshed
        window.location.reload();
      } else if (allSubscriptions.length === 0) {
        toast.info("No active subscriptions found to cancel");
      }
    };

    if (session?.user?.id) {
      cancelAllSubscriptions();
    }
  }, [allSubscriptions, isLoading, session?.user?.id, refetch, queryClient, cancelSubscription]);

  // This is a hidden component, no need to render anything
  return null;
};
