import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CurrentSubscription } from "@/components/subscription/CurrentSubscription";
import { SubscriptionTierCard } from "@/components/subscription/SubscriptionTierCard";

const Subscription = () => {
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
        .order('price', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

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
    <div className="container mx-auto py-8">
      <CurrentSubscription 
        subscription={subscription}
        onManageSubscription={handleManageSubscription}
      />

      <h1 className="text-3xl font-bold mb-8">Premium Subscriptions</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {tiers?.map((tier) => (
          <SubscriptionTierCard
            key={tier.id}
            tier={tier}
            currentTierId={subscription?.tier_id}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
    </div>
  );
};

export default Subscription;