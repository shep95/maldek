
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
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          ends_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    }
  });

  // Fetch all active subscriptions
  const { data: activeSubscriptions, isLoading } = useQuery({
    queryKey: ['all-active-subscriptions'],
    queryFn: async () => {
      // This should only be allowed for admins in a real app
      // For this example, we'll just fetch subscriptions
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  // When component mounts, cancel all premium subscriptions
  useEffect(() => {
    const cancelAllPremiumSubscriptions = async () => {
      if (!activeSubscriptions || isLoading) return;
      
      console.log("Found active subscriptions:", activeSubscriptions.length);
      
      let cancelledCount = 0;
      for (const subscription of activeSubscriptions) {
        try {
          await cancelSubscription.mutateAsync(subscription.user_id);
          cancelledCount++;
        } catch (error) {
          console.error("Error cancelling subscription:", error);
        }
      }
      
      if (cancelledCount > 0) {
        toast.success(`Cancelled ${cancelledCount} premium subscriptions`);
      }
    };

    if (session?.user?.id) {
      cancelAllPremiumSubscriptions();
    }
  }, [activeSubscriptions, isLoading, session?.user?.id]);

  // This is a hidden component, no need to render anything
  return null;
};
