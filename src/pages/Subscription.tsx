import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Crown, Check, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PricingCard } from "@/components/ui/pricing-card";

const Subscription = () => {
  const session = useSession();

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
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

  const { data: tiers, isLoading: isLoadingTiers } = useQuery({
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

  const handleSubscribe = async (tier) => {
    try {
      if (!session?.user?.id) {
        toast.error("Please sign in to subscribe");
        return;
      }

      toast.loading("Creating checkout session...");

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier: tier.name.toLowerCase(),
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

  const renderFeatures = (tier) => {
    if (tier.name === "True Emperor") {
      return [
        { text: "Everything in Creator tier", checked: true },
        { text: "Exclusive groupchat with other Emperors", checked: true },
        { text: "Gold crown", checked: true }
      ];
    }

    const features = [
      { text: tier.name === "Free" ? "280 character limit" : "Unlimited character limit", checked: true },
      { text: `${tier.monthly_mentions} monthly mentions`, checked: true },
      { text: tier.supports_animated_avatars ? "Animated avatars" : "Standard avatars", checked: tier.supports_animated_avatars },
      { text: tier.supports_nft_avatars ? "NFT avatars" : "Standard avatars", checked: tier.supports_nft_avatars },
      { text: tier.watermark_disabled ? "No watermarks" : "Watermarked media", checked: tier.watermark_disabled },
      { text: `${tier.max_pinned_posts} pinned ${tier.max_pinned_posts > 1 ? 'posts' : 'post'}`, checked: true },
    ];

    return features;
  };

  const isLoading = isLoadingSubscription || isLoadingTiers;

  const mapTiersToPricingCards = () => {
    if (!tiers) return [];
    
    return tiers.map(tier => {
      const isCurrentPlan = subscription?.tier_id === tier.id;
      
      let formattedPrice = "";
      if (tier.name === "True Emperor") {
        formattedPrice = "$8,000/year";
      } else if (tier.name === "Free") {
        formattedPrice = "Free";
      } else {
        formattedPrice = `$${tier.price}/month`;
      }
      
      let bestFor = "";
      if (tier.name === "Free") bestFor = "Basic features for everyone";
      else if (tier.name === "Creator") bestFor = "Perfect for content creators";
      else if (tier.name === "True Emperor") bestFor = "Ultimate premium experience";
      
      return {
        tier: tier.name,
        price: formattedPrice,
        bestFor,
        CTA: "Subscribe",
        benefits: renderFeatures(tier),
        isCurrentPlan,
        onClickCTA: () => handleSubscribe(tier)
      };
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12 space-y-3">
          <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
            Subscription Plans
          </h2>
          <p className="text-center text-base text-muted-foreground md:text-lg">
            Choose the right plan to enhance your social media experience.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-pulse w-full max-w-4xl">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
              <div className="flex flex-col gap-8">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {subscription && (
              <div className="mb-8">
                <Card className="overflow-hidden border-primary/20">
                  <CardHeader className="bg-primary/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {subscription.tier?.name === 'True Emperor' && (
                            <Crown className="h-5 w-5 text-yellow-500" />
                          )}
                          {subscription.tier?.name || 'Current Subscription'}
                        </CardTitle>
                        <CardDescription>
                          Your current subscription plan
                        </CardDescription>
                      </div>
                      <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                        {subscription.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Subscription details</h3>
                        <ul className="space-y-1 text-sm">
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Plan:</span> 
                            <span>{subscription.tier?.name || 'Unknown'}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span> 
                            <span>{subscription.status}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Monthly mentions:</span> 
                            <span>{subscription.tier?.monthly_mentions || 0}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Mentions remaining:</span> 
                            <span>{subscription.mentions_remaining || 0}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Character limit:</span> 
                            <span>Unlimited</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Plan features</h3>
                        <ul className="space-y-1 text-sm">
                          {subscription.tier && renderFeatures(subscription.tier).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              {feature.checked ? 
                                <Check className="h-4 w-4 text-primary" /> : 
                                <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">-</span>
                              }
                              <span>{feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  {subscription.status === 'active' && (
                    <CardFooter className="border-t bg-muted/20 px-6 py-4">
                      <Button 
                        onClick={handleManageSubscription}
                        className="ml-auto"
                      >
                        Manage Subscription
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {mapTiersToPricingCards()
                .filter(card => card.tier !== "Free" && card.price !== "$0/month")
                .map((cardProps, index) => (
                <PricingCard
                  key={index}
                  {...cardProps}
                  className="h-full w-full" // Make cards rectangular
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Subscription;
