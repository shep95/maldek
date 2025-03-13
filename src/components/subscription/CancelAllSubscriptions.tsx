
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
      // Invalidate both premium-subscriptions and user-subscription queries to update UI
      queryClient.invalidateQueries({ queryKey: ['premium-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error("Failed to cancel subscription");
    }
  });

  // Fetch ALL active premium subscriptions (Emperor and Creator tiers)
  const { data: premiumSubscriptions, isLoading, refetch } = useQuery({
    queryKey: ['premium-subscriptions'],
    queryFn: async () => {
      console.log('Fetching premium subscriptions');
      // This should only be allowed for admins in a real app
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('status', 'active')
        .in('tier.name', ['True Emperor', 'Creator']);

      if (error) {
        console.error('Error fetching premium subscriptions:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} premium subscriptions to cancel`);
      return data || [];
    },
    enabled: !!session?.user?.id,
    staleTime: 0, // Don't cache this query
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });

  // When component mounts, cancel all premium subscriptions
  useEffect(() => {
    const cancelAllPremiumSubscriptions = async () => {
      if (!premiumSubscriptions || isLoading) return;
      
      console.log("Starting cancellation of premium subscriptions:", premiumSubscriptions.length);
      
      let cancelledCount = 0;
      const promises = [];
      
      for (const subscription of premiumSubscriptions) {
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
        toast.success(`Cancelled ${cancelledCount} premium subscriptions`);
        // Force refetch to update UI immediately
        refetch();
        queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      } else if (premiumSubscriptions.length === 0) {
        toast.info("No premium subscriptions found to cancel");
      }
    };

    if (session?.user?.id) {
      cancelAllPremiumSubscriptions();
    }
  }, [premiumSubscriptions, isLoading, session?.user?.id, refetch, queryClient]);

  // This is a hidden component, no need to render anything
  return null;
};
