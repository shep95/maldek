
import React from "react";
import { PricingDemo } from "@/components/ui/pricing-demo";
import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";

const Subscription = () => {
  const session = useSession();
  
  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose a plan that suits your needs. Upgrade anytime to get more features.
        </p>
      </div>
      
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-accent"></span>
          Your Current Plan
        </h2>
        <p>
          You're currently on the <span className="font-bold text-accent">Premium</span> plan.
          All premium features are enabled for your account.
        </p>
      </Card>
      
      <PricingDemo />
      
      <div className="mt-12 text-sm text-muted-foreground">
        <p className="mb-2">
          * All plans include core features like profiles, posts, notifications, and basic analytics.
        </p>
        <p>
          Have questions about our plans? <a href="#" className="text-accent underline">Contact our sales team</a>.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
