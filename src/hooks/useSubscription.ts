
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

export type SubscriptionData = {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  isLoading: boolean;
  error: string | null;
};

export type SubscriptionFeatures = {
  canUseAI: boolean;
  canUploadGifs: boolean;
  canUseAnimatedAvatar: boolean;
  canUseNFTAvatar: boolean;
  hasWatermarkFree: boolean;
  hasSecurityFolder: boolean;
  canStartSpaces: boolean;
  hasPrioritySupport: boolean;
  hasScheduledPosts: boolean;
  hasExtendedHistory: boolean;
  hasPrivacyFeatures: boolean;
};

export function useSubscription() {
  const session = useSession();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    isLoading: true,
    error: null,
  });

  // Calculate if subscription is active based on subscription end date
  const isSubscriptionActive = () => {
    if (!subscriptionData.subscribed || !subscriptionData.subscription_end) {
      return false;
    }
    
    const endDate = new Date(subscriptionData.subscription_end);
    const now = new Date();
    return endDate > now;
  };

  // Calculate available features based on subscription tier and active status
  const subscriptionFeatures: SubscriptionFeatures = {
    // Base features available to all active subscriptions
    canUseAI: isSubscriptionActive(),
    canUploadGifs: isSubscriptionActive(),
    canUseAnimatedAvatar: isSubscriptionActive(),
    hasWatermarkFree: isSubscriptionActive(),
    hasSecurityFolder: isSubscriptionActive(),
    canStartSpaces: isSubscriptionActive(),
    
    // Pro-tier specific features
    canUseNFTAvatar: isSubscriptionActive() && subscriptionData.subscription_tier === 'Pro',
    hasPrioritySupport: isSubscriptionActive() && subscriptionData.subscription_tier === 'Pro',
    
    // Features available to both Creator and Pro tiers
    hasScheduledPosts: isSubscriptionActive(),
    hasExtendedHistory: isSubscriptionActive(),
    hasPrivacyFeatures: isSubscriptionActive(),
  };

  const checkSubscription = async () => {
    if (!session?.access_token) return;

    try {
      console.log("Checking subscription status...");
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setSubscriptionData(prev => ({ 
          ...prev, 
          error: error.message,
          isLoading: false 
        }));
        return;
      }

      console.log("Subscription data received:", data);
      setSubscriptionData({
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error in subscription check:", error);
      setSubscriptionData(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false 
      }));
    }
  };

  const createCheckoutSession = async (tier: string) => {
    if (!session?.access_token) {
      toast.error("You must be logged in to subscribe");
      return;
    }

    try {
      console.log("Creating checkout session for tier:", tier);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error creating checkout:", error);
        toast.error(`Checkout error: ${error.message}`);
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error in checkout:", error);
      toast.error(`Checkout error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      toast.error("You must be logged in to manage your subscription");
      return;
    }

    try {
      console.log("Opening customer portal...");
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error opening customer portal:", error);
        toast.error(`Error: ${error.message}`);
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Check subscription status on component mount and when session changes
  useEffect(() => {
    if (session?.access_token) {
      checkSubscription();
    } else {
      setSubscriptionData(prev => ({...prev, isLoading: false}));
    }
  }, [session?.access_token]);

  // Periodically check subscription status if user is subscribed
  useEffect(() => {
    if (session?.access_token && subscriptionData.subscribed) {
      const interval = setInterval(() => {
        checkSubscription();
      }, 60000 * 30); // Check every 30 minutes
      
      return () => clearInterval(interval);
    }
  }, [session?.access_token, subscriptionData.subscribed]);

  // Re-check subscription after success redirect from Stripe
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get("success");
    
    if (success === "true" && session?.access_token) {
      // Short delay to allow Stripe to process the payment
      const timer = setTimeout(() => {
        checkSubscription();
        toast.success("Thank you for your subscription! Refreshing your access...");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [window.location.search, session?.access_token]);

  return {
    ...subscriptionData,
    features: subscriptionFeatures,
    isActive: isSubscriptionActive(),
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
  };
}
