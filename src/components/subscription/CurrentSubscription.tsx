import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface CurrentSubscriptionProps {
  subscription: any;
  onManageSubscription: () => void;
}

export const CurrentSubscription = ({ subscription, onManageSubscription }: CurrentSubscriptionProps) => {
  if (!subscription) return null;

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Current Subscription</h2>
        <Badge variant="secondary" className={subscription.tier.name === 'Creator' ? 'bg-orange-500/10 text-orange-500' : 'bg-yellow-500/10 text-yellow-500'}>
          {subscription.status}
        </Badge>
      </div>
      <p className="text-lg mb-4">You are currently on the <span className="font-bold">{subscription.tier.name}</span> plan</p>
      <div className="space-y-2 mb-6">
        <p>Mentions remaining: {subscription.mentions_remaining}</p>
        <p>Renewal date: {new Date(subscription.ends_at).toLocaleDateString()}</p>
      </div>
      <Button onClick={onManageSubscription} className="w-full sm:w-auto">
        Manage Subscription <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  );
};