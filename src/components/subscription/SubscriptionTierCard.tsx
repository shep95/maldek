
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseFeatures } from "./features/BaseFeatures";
import { PremiumFeatures } from "./features/PremiumFeatures";
import { StandardFeatures } from "./features/StandardFeatures";
import { FeatureItem } from "./features/FeatureItem";

interface SubscriptionTierProps {
  tier: any;
  currentTierId?: string;
  onSubscribe: (tier: string) => void;
}

export const SubscriptionTierCard = ({ tier, currentTierId, onSubscribe }: SubscriptionTierProps) => {
  const isEmperor = tier.name === 'True Emperor';
  const isCreator = tier.name === 'Creator';
  const isPremium = isEmperor || isCreator;
  
  const formatPrice = (price: number) => {
    // For Emperor tier, always show $8,000 regardless of the tier.price value
    if (isEmperor) {
      return "8,000";
    }
    // For other tiers, use the existing formatting logic
    return price % 1 === 0 ? price.toLocaleString() : price.toFixed(2);
  };

  const handleSubscribe = () => {
    if (isEmperor) {
      window.location.href = 'https://buy.stripe.com/3cs3eJghj4ocek0fZ0';
    } else if (isCreator) {
      window.location.href = 'https://buy.stripe.com/fZe02x0il1c0fo4bIJ';
    } else {
      onSubscribe(tier.name);
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden backdrop-blur-sm transition-all duration-300",
      "border-2 hover:border-opacity-75 hover:scale-[1.02]",
      "p-8 flex flex-col gap-6",
      isEmperor ? "border-yellow-500/50" : isCreator ? "border-white/50" : "border-accent/50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className={cn(
            "text-2xl font-bold flex items-center gap-2",
            isEmperor ? "text-yellow-500" : isCreator ? "text-white" : ""
          )}>
            {tier.name}
            {isPremium && <Crown className={cn("h-6 w-6", isEmperor ? "text-yellow-500" : "text-white")} />}
          </h2>
        </div>
        <Badge variant="secondary" className={cn(
          "uppercase tracking-wider font-medium",
          isEmperor ? "bg-yellow-500/10 text-yellow-500" : 
          isCreator ? "bg-white/10 text-white" : "bg-accent/10 text-accent"
        )}>
          {isEmperor ? 'Yearly' : 'Premium'}
        </Badge>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">${formatPrice(tier.price)}</span>
        <span className="text-sm text-muted-foreground">/{isEmperor ? 'year' : 'month'}</span>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-4">
        {/* Premium Badge */}
        <FeatureItem
          icon={Crown}
          text={isEmperor ? 'Gold Crown Badge' : 'Premium Badge'}
          iconColor={isEmperor ? "text-yellow-500" : isCreator ? "text-white" : ""}
        />

        {/* Premium Features */}
        {isPremium && <PremiumFeatures />}

        {/* Creator-only Features */}
        {isCreator && (
          <>
            <FeatureItem
              icon={Lock}
              text="Privacy Features & Private Posts"
              iconColor="text-white"
              badge={{ text: "NEW", variant: "beta" }}
            />
            <FeatureItem
              icon={Crown}
              text="Only Available To The First 100k Subscribers"
              iconColor="text-white"
              badge={{ text: "Limited", variant: "beta" }}
            />
          </>
        )}

        {/* Standard Features */}
        <StandardFeatures tier={tier} />

        {/* Base Features */}
        <BaseFeatures />

        {/* Emperor-only Features */}
        {isEmperor && (
          <FeatureItem
            icon={Crown}
            text="Emperor Chatroom Access"
            iconColor="text-yellow-500"
            badge={{ text: "VIP", variant: "vip" }}
          />
        )}
      </ul>

      {/* Action Button */}
      <Button 
        onClick={handleSubscribe}
        className={cn(
          "w-full mt-4",
          isEmperor ? "bg-yellow-500 hover:bg-yellow-400 text-black" :
          isCreator ? "bg-white hover:bg-white/90 text-black" : ""
        )}
        variant={currentTierId === tier.id ? "secondary" : "default"}
        disabled={currentTierId === tier.id}
      >
        {currentTierId === tier.id ? 'Current Plan' : 'Subscribe'}
      </Button>
    </Card>
  );
};
