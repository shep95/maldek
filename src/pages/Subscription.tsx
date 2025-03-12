
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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

      toast.loading("Creating checkout session...");

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier: tier.toLowerCase(),
          userId: session.user.id,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error("Failed to start checkout process");
        return;
      }

      if (!data?.url) {
        console.error("No checkout URL returned");
        toast.error("Failed to create checkout session");
        return;
      }

      console.log("Redirecting to checkout:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
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
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Subscription Plans</h1>
        
        {subscription && (
          <div className="mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
              <p>Plan: {subscription.tier?.name || 'Unknown'}</p>
              <p>Status: {subscription.status}</p>
              {subscription.status === 'active' && (
                <Button 
                  onClick={handleManageSubscription}
                  className="mt-4"
                >
                  Manage Subscription
                </Button>
              )}
            </Card>
          </div>
        )}
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers?.map((tier) => (
            <Card key={tier.id} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <div className="text-2xl font-bold">${tier.price}/month</div>
              </div>
              <ul className="space-y-2 mb-6">
                <li>Character limit: {tier.post_character_limit}</li>
                <li>Monthly mentions: {tier.monthly_mentions}</li>
              </ul>
              <Button 
                onClick={() => handleSubscribe(tier.name)}
                className="w-full"
                disabled={subscription?.tier_id === tier.id}
              >
                {subscription?.tier_id === tier.id ? 'Current Plan' : 'Subscribe'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
