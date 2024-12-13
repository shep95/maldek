import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, DollarSign, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier: tier.toLowerCase(),
          userId: session.user.id,
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error("Failed to start checkout process");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Premium Subscriptions</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {tiers?.map((tier) => (
          <Card key={tier.id} className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{tier.name}</h2>
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                Beta
              </Badge>
            </div>
            <p className="text-4xl font-bold mb-6">${tier.price}<span className="text-sm">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-500" />
                {tier.monthly_mentions} mentions per month
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-500" />
                {tier.name === 'Creator' ? 'Orange' : 'Gold'} checkmark
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-500" />
                Priority support
              </li>
              <li className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-orange-500" />
                <span>
                  Payouts (Beta Testing)
                </span>
              </li>
              <li className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-orange-500" />
                <span className="flex items-center gap-2">
                  DAARP AI (BETA)
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 text-xs">
                    NEW
                  </Badge>
                </span>
              </li>
            </ul>
            <Button 
              onClick={() => handleSubscribe(tier.name)}
              className="mt-auto"
              variant={subscription?.tier_id === tier.id ? "secondary" : "default"}
              disabled={subscription?.tier_id === tier.id}
            >
              {subscription?.tier_id === tier.id ? 'Current Plan' : 'Subscribe'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscription;