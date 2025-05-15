
import React from "react";
import { PricingSectionDemo } from "@/components/ui/pricing-demo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { ArrowPathIcon } from "lucide-react";

const Subscription = () => {
  const session = useSession();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    isLoading, 
    error, 
    checkSubscription,
    openCustomerPortal
  } = useSubscription();

  // Check for URL query parameters to show success/cancel messages
  const searchParams = new URLSearchParams(window.location.search);
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  
  React.useEffect(() => {
    if (success) {
      // Refresh subscription status when returning from successful checkout
      checkSubscription();
    }
  }, [success]);
  
  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          {session && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkSubscription}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh Status
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          Choose a plan that suits your needs. Upgrade anytime to get more features.
        </p>
      </div>
      
      {success && (
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            Subscription Successful
          </h2>
          <p>
            Thank you for your subscription! Your account has been upgraded.
          </p>
        </Card>
      )}
      
      {canceled && (
        <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500"></span>
            Subscription Canceled
          </h2>
          <p>
            Your subscription process was canceled. You can try again whenever you're ready.
          </p>
        </Card>
      )}
      
      {session && subscribed && (
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-accent"></span>
            Your Current Plan
          </h2>
          <p className="mb-4">
            You're currently on the <span className="font-bold text-accent">{subscription_tier}</span> plan.
            {subscription_end && (
              <> Your subscription renews on {format(new Date(subscription_end), 'MMMM d, yyyy')}.</>
            )}
          </p>
          <Button 
            variant="outline" 
            onClick={openCustomerPortal}
            className="hover:bg-accent/10"
          >
            Manage Subscription
          </Button>
        </Card>
      )}
      
      <PricingSectionDemo />
      
      <div className="mt-12 text-sm text-muted-foreground">
        <p className="mb-2">
          * All plans include core features like profiles, posts, notifications, and basic analytics.
        </p>
        <p>
          Have questions about our plans? <a href="mailto:support@bosley.app" className="text-accent underline">Contact our sales team</a>.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
