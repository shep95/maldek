
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, Mic, BarChart2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionTierProps {
  tier: any;
  currentTierId?: string;
  onSubscribe: (tier: string) => void;
}

export const SubscriptionTierCard = ({ tier, currentTierId, onSubscribe }: SubscriptionTierProps) => {
  const isEmperor = tier.name === 'True Emperor';
  const isCreator = tier.name === 'Creator';
  const isPremium = isEmperor || isCreator;
  
  // Format the price to ensure it shows as a whole number when there are no decimals
  const formatPrice = (price: number) => {
    return price % 1 === 0 ? price.toFixed(0) : price.toFixed(2);
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
          {isEmperor ? 'Lifetime' : 'Premium'}
        </Badge>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">${formatPrice(tier.price)}</span>
        {!isEmperor && <span className="text-sm text-muted-foreground">/month</span>}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-4">
        <li className="flex items-center gap-3">
          <Crown className={cn(
            "h-5 w-5",
            isEmperor ? "text-yellow-500" : isCreator ? "text-white" : ""
          )} />
          <span>{isEmperor ? 'Gold Crown Badge' : 'Premium Badge'}</span>
        </li>
        
        <li className="flex items-center gap-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>{tier.monthly_mentions} mentions per month</span>
        </li>

        <li className="flex items-center gap-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>Upload files up to {isEmperor ? '5GB' : '3GB'}</span>
        </li>

        <li className="flex items-center gap-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>{tier.post_character_limit?.toLocaleString()} character limit</span>
        </li>
        
        <li className="flex items-center gap-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>Schedule posts up to {tier.schedule_days_limit} days ahead</span>
        </li>

        <li className="flex items-center gap-3">
          <Download className="h-5 w-5 text-white" />
          <span>Download videos and images</span>
        </li>

        <li className="flex items-center gap-3">
          <Mic className="h-5 w-5 text-white" />
          <div className="flex items-center gap-2">
            <span>Access to Spaces</span>
            <Badge variant="secondary" className="bg-white/10 text-white text-xs">
              BETA
            </Badge>
          </div>
        </li>

        {/* Advanced Analytics Feature */}
        <li className="flex items-center gap-3">
          <BarChart2 className="h-5 w-5 text-white" />
          <div className="flex items-center gap-2">
            <span>Advanced Analytics Dashboard</span>
            <Badge variant="secondary" className="bg-white/10 text-white text-xs">
              PRO
            </Badge>
          </div>
        </li>

        {isEmperor && (
          <li className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-yellow-500" />
            <div className="flex items-center gap-2">
              <span>Emperor Chatroom Access</span>
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-xs">
                VIP
              </Badge>
            </div>
          </li>
        )}
      </ul>

      {/* Action Button */}
      <Button 
        onClick={() => onSubscribe(tier.name)}
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
