
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const LiveSubscriptionCounts = () => {
  const { data: tiers } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: creatorSubscriptionCount, refetch: refetchCreatorCount } = useQuery({
    queryKey: ['creator-subscription-count'],
    queryFn: async () => {
      const creatorTier = tiers?.find(t => t.price === 3.50);
      if (!creatorTier) return null;

      const { count, error } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('tier_id', creatorTier.id)
        .eq('status', 'active')
        .gte('ends_at', new Date().toISOString());

      if (error) {
        console.error("Error fetching creator subscription count:", error);
        return null;
      }

      return count;
    },
    enabled: !!tiers
  });

  const { data: emperorSubscriptionCount, refetch: refetchEmperorCount } = useQuery({
    queryKey: ['emperor-subscription-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_lifetime', true)
        .eq('status', 'active');

      if (error) {
        console.error("Error fetching emperor subscription count:", error);
        return null;
      }

      return count;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions'
        },
        () => {
          refetchCreatorCount();
          refetchEmperorCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchCreatorCount, refetchEmperorCount]);

  if (!creatorSubscriptionCount && !emperorSubscriptionCount) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-2 bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
      <div className="text-center space-y-2">
        {creatorSubscriptionCount !== null && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-accent">{creatorSubscriptionCount}</span> active Creator members
          </p>
        )}
        {emperorSubscriptionCount !== null && emperorSubscriptionCount > 0 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-yellow-500">{emperorSubscriptionCount}</span> True Emperors
          </p>
        )}
      </div>
    </div>
  );
};
