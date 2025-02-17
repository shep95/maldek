
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Crown, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface CurrentSubscriptionProps {
  subscription: any;
  onManageSubscription: () => void;
}

export const CurrentSubscription = ({ subscription, onManageSubscription }: CurrentSubscriptionProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!subscription) return null;

  const isEmperor = subscription.tier.name === 'True Emperor';
  const isCreator = subscription.tier.name === 'Creator';
  const isPremium = isEmperor || isCreator;
  const isLifetime = subscription.is_lifetime;

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('mercury-webhook', {
        body: {
          action: 'cancel',
          subscriptionId: subscription.id,
        },
      });

      if (error) throw error;

      toast.success("Subscription cancelled successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  return (
    <Card className="relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-background/10 z-0" />

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
                {isLifetime ? 'Lifetime access' : `Renewal: ${new Date(subscription.ends_at).toLocaleDateString()}`}
              </span>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button 
              onClick={onManageSubscription}
              className={cn(
                isPremium ? "bg-white hover:bg-white/90 text-black" : ""
              )}
            >
              Manage Subscription
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>

            {!isLifetime && subscription.status === 'active' && (
              <Button 
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
