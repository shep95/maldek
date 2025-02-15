
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Crown, Star, Sparkles } from "lucide-react";
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

  return (
    <Card className="relative overflow-hidden backdrop-blur-sm">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-background/10 z-0" />

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">Current Plan</h2>
            {isEmperor && <Crown className="h-8 w-8 text-yellow-500" />}
            {isCreator && <Star className="h-8 w-8 text-orange-500" />}
          </div>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-sm px-3 py-1",
              isEmperor ? "bg-yellow-500/10 text-yellow-500" : 
              isCreator ? "bg-orange-500/10 text-orange-500" : 
              "bg-accent/10 text-accent"
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
              Unlock premium features and enhance your experience
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span>Mentions remaining: {subscription.mentions_remaining}</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-accent" />
              <span>Renewal: {new Date(subscription.ends_at).toLocaleDateString()}</span>
            </div>
          </div>

          <Button 
            onClick={onManageSubscription}
            className={cn(
              "mt-4",
              isEmperor ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
              isCreator ? "bg-orange-500 hover:bg-orange-600" :
              ""
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
