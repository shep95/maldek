
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CurrentSubscription } from "@/components/subscription/CurrentSubscription";
import { SubscriptionTierCard } from "@/components/subscription/SubscriptionTierCard";
import { useState, useEffect } from "react";

const Subscription = () => {
  const [discountCode, setDiscountCode] = useState<string>('');
  const session = useSession();

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      try {
        console.log("Fetching user subscription data...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found");
          return null;
        }

        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            tier:subscription_tiers(*)
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching subscription:", error);
          return null;
        }

        console.log("Subscription data:", subscription);
        return subscription;
      } catch (error) {
        console.error("Error in subscription query:", error);
        return null;
      }
    },
    enabled: !!session?.user?.id
  });

  const { data: tiers } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .neq('name', 'True Emperor Lifetime')
        .order('price', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: creatorSubscriptionCount, refetch: refetchCreatorCount } = useQuery({
    queryKey: ['creator-subscription-count'],
    queryFn: async () => {
      try {
        // Get the Creator tier ID
        const creatorTier = tiers?.find(t => Math.abs(t.price - 3.50) < 0.01);
        if (!creatorTier) {
          console.log("Creator tier not found");
          return null;
        }

        console.log("Fetching count for Creator tier ID:", creatorTier.id);

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

        console.log("Creator subscription count:", count);
        return count;
      } catch (error) {
        console.error("Error in creator count query:", error);
        return null;
      }
    },
    enabled: !!tiers
  });

  const { data: emperorSubscriptionCount, refetch: refetchEmperorCount } = useQuery({
    queryKey: ['emperor-subscription-count'],
    queryFn: async () => {
      try {
        console.log("Fetching emperor subscription count...");
        const { count, error } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('is_lifetime', true)
          .eq('status', 'active');

        if (error) {
          console.error("Error fetching emperor subscription count:", error);
          return null;
        }

        console.log("Emperor subscription count:", count);
        return count;
      } catch (error) {
        console.error("Error in emperor count query:", error);
        return null;
      }
    }
  });

  useEffect(() => {
    console.log("Setting up subscription change listener...");
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions'
        },
        (payload) => {
          console.log("Subscription change detected:", payload);
          refetchCreatorCount();
          refetchEmperorCount();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up subscription listener...");
      supabase.removeChannel(channel);
    };
  }, [refetchCreatorCount, refetchEmperorCount]);

  const handleSubscribe = async (tier: string) => {
    try {
      if (!session?.user?.id) {
        toast.error("Please sign in to subscribe");
        return;
      }

      toast.loading("Creating checkout session...", {
        duration: 0,
        id: "checkout-toast"
      });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier: tier.toLowerCase(),
          userId: session.user.id,
          discountCode: discountCode.trim() || undefined,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.dismiss("checkout-toast");
        toast.error("Failed to start checkout process");
        return;
      }

      if (!data?.url) {
        console.error("No checkout URL returned");
        toast.dismiss("checkout-toast");
        toast.error("Failed to create checkout session");
        return;
      }

      console.log("Redirecting to checkout:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.dismiss("checkout-toast");
      toast.error("Failed to start checkout process");
    }
  };

  const handleManageSubscription = async () => {
    try {
      if (!session?.user?.id || !subscription?.stripe_customer_id) {
        toast.error("No active subscription found");
        return;
      }

      toast.loading("Loading subscription portal...");

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          customerId: subscription.stripe_customer_id,
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error("No portal URL returned");
      }

      console.log("Redirecting to portal:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error("Failed to open subscription management");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Premium Subscriptions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features and enhance your experience with our subscription tiers
          </p>
          <div className="mt-4 space-y-2">
            {creatorSubscriptionCount !== null && (
              <p className="text-sm text-muted-foreground">
                Join our community of <span className="font-semibold text-accent">{creatorSubscriptionCount}</span> active Creator tier subscribers!
              </p>
            )}
            {emperorSubscriptionCount !== null && emperorSubscriptionCount > 0 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-yellow-500">{emperorSubscriptionCount}</span> True Emperors have achieved lifetime status
              </p>
            )}
          </div>
        </div>

        {subscription && (
          <div className="mb-16">
            <CurrentSubscription 
              subscription={subscription}
              onManageSubscription={handleManageSubscription}
            />
          </div>
        )}

        <div className="flex flex-col space-y-8 max-w-2xl mx-auto">
          {tiers?.map((tier) => (
            <SubscriptionTierCard
              key={tier.id}
              tier={tier}
              currentTierId={subscription?.tier_id}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">All Premium Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Content Creation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Extended character limits</li>
                <li>Schedule posts ahead</li>
                <li>Premium media uploads</li>
              </ul>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Analytics</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Advanced metrics</li>
                <li>Engagement insights</li>
                <li>Performance tracking</li>
              </ul>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Premium Access</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Emperor Chatroom</li>
                <li>Priority support</li>
                <li>Exclusive badges</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
