
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CurrentSubscriptionProps {
  subscription: any;
  onManageSubscription: () => void;
}

export const CurrentSubscription = ({ subscription, onManageSubscription }: CurrentSubscriptionProps) => {
  if (!subscription) return null;

  const isEmperor = subscription.tier.name === 'True Emperor';
  const isCreator = subscription.tier.name === 'Creator';
  const isPremium = isEmperor || isCreator;

  return (
    <Card className="relative overflow-hidden backdrop-blur-sm">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-background/10 z-0" />

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">Current Plan</h2>
            {isPremium && <Crown className={cn("h-8 w-8", isEmperor ? "text-yellow-500" : "text-white")} />}
          </div>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-sm px-3 py-1",
              isPremium ? "bg-white/10 text-white" : "bg-accent/10 text-accent"
            )}
          >
            {subscription.status}
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl mb-2">
              <span className="font-bold">{subscription.tier.name}</span> Plan
            </h3>
            <p className="text-muted-foreground">
              {isEmperor ? 'Lifetime access to all premium features' : 'Premium features and downloads'}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span>Mentions remaining: {subscription.mentions_remaining}</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-accent" />
              <span>
                {isEmperor ? 'Lifetime access' : `Renewal: ${new Date(subscription.ends_at).toLocaleDateString()}`}
              </span>
            </div>
          </div>

          <Button 
            onClick={onManageSubscription}
            className={cn(
              "mt-4",
              isPremium ? "bg-white hover:bg-white/90 text-black" : ""
            )}
          >
            Manage Subscription
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
