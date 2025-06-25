
import React, { useEffect } from "react";
import { PricingSectionDemo } from "@/components/ui/pricing-demo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { RefreshCw, Check, AlertCircle, Clock } from "lucide-react";

const Subscription = () => {
  const session = useSession();
  const {
    subscribed,
    subscription_tier,
    subscription_end,
    isLoading,
    error,
    features,
    isActive,
    checkSubscription,
    openCustomerPortal
  } = useSubscription();

  // Check for URL query parameters to show success/cancel messages
  const searchParams = new URLSearchParams(window.location.search);
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success === "true") {
      // Refresh subscription status when returning from successful checkout
      checkSubscription();
    }
  }, [success, checkSubscription]);

  // Format subscription end date with relative time
  const formatSubscriptionEnd = () => {
    if (!subscription_end) return null;
    
    const endDate = new Date(subscription_end);
    const now = new Date();
    
    // Calculate days remaining
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      return <span className="text-red-500">Expired</span>;
    } else if (daysRemaining === 1) {
      return <span className="text-amber-500">Expires today</span>;
    } else if (daysRemaining <= 3) {
      return <span className="text-amber-500">Expires in {daysRemaining} days</span>;
    } else {
      return <span>Renews on {format(endDate, 'MMMM d, yyyy')}</span>;
    }
  };

  return <div className="container py-8 space-y-8 animate-fade-in px-0">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          {session && <Button variant="outline" size="sm" onClick={checkSubscription} disabled={isLoading} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>}
        </div>
        <p className="text-muted-foreground">
          Choose a plan that suits your needs. Upgrade anytime to get more features.
        </p>
      </div>
      
      {success === "true" && <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            Subscription Successful
          </h2>
          <p>
            Thank you for your subscription! Your account has been upgraded and premium features are now available.
          </p>
        </Card>}
      
      {canceled === "true" && <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500"></span>
            Subscription Canceled
          </h2>
          <p>
            Your subscription process was canceled. You can try again whenever you're ready.
          </p>
        </Card>}
      
      {session && subscribed && (
        <Card className={`p-6 bg-gradient-to-br ${isActive ? 'from-accent/10 to-accent/5 border-accent/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${isActive ? 'bg-accent' : 'bg-red-500'}`}></span>
            Your Current Plan
          </h2>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
            <p>
              You're currently on the <span className="font-bold text-accent">{subscription_tier}</span> plan.
            </p>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {formatSubscriptionEnd()}
            </div>
          </div>
          
          {!isActive && (
            <div className="mb-4 p-3 bg-red-500/10 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-500">Your subscription has expired</p>
                <p className="text-sm">Your premium features are no longer available. Please renew your subscription to continue using premium features.</p>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Your Active Features</h3>
            <ul className="space-y-2">
              {features.canUseAI && <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> AI Chat & Content Tools
                </li>}
              {features.canUploadGifs && <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> GIF Upload Support
                </li>}
              {features.canUseAnimatedAvatar && <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> Animated Avatar Support
                </li>}
              {features.canUseNFTAvatar && <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> NFT Avatar Support
                </li>}
              {features.hasWatermarkFree && <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> Watermark-Free Media
                </li>}
              {features.hasPrivacyFeatures && <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> Private Posts & Privacy Features
                </li>}
              {features.hasPrioritySupport && <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> Priority Customer Support
                </li>}
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={openCustomerPortal} className="hover:bg-accent/10">
              Manage Subscription
            </Button>
            
            {!isActive && (
              <Button onClick={() => window.location.href = '#pricing'} className="bg-accent hover:bg-accent/80">
                Renew Subscription
              </Button>
            )}
          </div>
        </Card>
      )}
      
      <div id="pricing">
        <PricingSectionDemo />
      </div>
      
      <div className="mt-12 text-sm text-muted-foreground">
        <p className="mb-2">
          * All plans include core features like profiles, posts, notifications, and basic analytics.
        </p>
        <p>
          Have questions about our plans? <a href="mailto:support@bosley.app" className="text-accent underline">Contact our sales team</a>.
        </p>
      </div>
    </div>;
};

export default Subscription;
