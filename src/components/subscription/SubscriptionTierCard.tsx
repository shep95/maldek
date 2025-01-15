import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, DollarSign, Sparkles, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionTierProps {
  tier: any;
  currentTierId?: string;
  onSubscribe: (tier: string) => void;
}

export const SubscriptionTierCard = ({ tier, currentTierId, onSubscribe }: SubscriptionTierProps) => {
  const isEmperor = tier.name === 'True Emperor';
  const isCreator = tier.name === 'Creator';
  const isBusiness = tier.name === 'Business';
  
  const getCrownColor = () => {
    if (isEmperor) return "text-yellow-500";
    if (isCreator) return "text-orange-500";
    if (isBusiness) return "text-purple-500";
    return "";
  };

  const getBorderColor = () => {
    if (isEmperor) return "border-yellow-500/50";
    if (isCreator) return "border-orange-500/50";
    if (isBusiness) return "border-purple-500/50";
    return "";
  };

  const getBadgeColor = () => {
    if (isEmperor) return "bg-yellow-500/10 text-yellow-500";
    if (isCreator) return "bg-orange-500/10 text-orange-500";
    if (isBusiness) return "bg-purple-500/10 text-purple-500";
    return "";
  };

  return (
    <Card className={cn(
      "relative overflow-hidden backdrop-blur-sm transition-all duration-300",
      "border-2 hover:border-opacity-75 hover:scale-[1.02]",
      "p-8 flex flex-col gap-6",
      getBorderColor(),
      isEmperor && "bg-black/40"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className={cn(
            "text-2xl font-bold flex items-center gap-2",
            getCrownColor()
          )}>
            {tier.name}
            <Crown className={cn("h-6 w-6", getCrownColor())} />
          </h2>
        </div>
        <Badge variant="secondary" className={cn(
          "uppercase tracking-wider font-medium",
          getBadgeColor()
        )}>
          {isEmperor ? 'Exclusive' : 'Beta'}
        </Badge>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">${isEmperor ? '50,000' : tier.price}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-4">
        <li className="flex items-center gap-3">
          <Crown className={cn("h-5 w-5", getCrownColor())} />
          <span>{tier.name} crown badge</span>
        </li>
        
        <li className="flex items-center gap-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>{tier.monthly_mentions} mentions per month</span>
        </li>

        <li className="flex items-center gap-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>Upload files up to {isEmperor ? '10TB' : `${tier.max_upload_size_mb >= 1024 ? `${(tier.max_upload_size_mb / 1024).toFixed(0)}GB` : `${tier.max_upload_size_mb}MB`}`}</span>
        </li>

        {isEmperor && (
          <>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>{tier.post_character_limit.toLocaleString()} character limit</span>
            </li>
            
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Schedule posts up to {tier.schedule_days_limit} days ahead</span>
            </li>

            <li className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-yellow-500" />
              <div className="flex items-center gap-2">
                <span>Exclusive Emperor Chatroom</span>
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-xs">
                  EXCLUSIVE
                </Badge>
              </div>
            </li>
          </>
        )}

        <li className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <div className="flex items-center gap-2">
            <span>{isEmperor ? 'Custom Analytics Dashboard Builder' : 'Advanced Analytics Dashboard'}</span>
            <Badge variant="secondary" className={cn(
              "text-xs",
              getBadgeColor()
            )}>
              {isEmperor ? 'EMPEROR' : 'PRO'}
            </Badge>
          </div>
        </li>

        <li className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-orange-500" />
          <span>Payouts (Beta Testing)</span>
        </li>

        <li className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <div className="flex items-center gap-2">
            <span>DAARP AI (BETA)</span>
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 text-xs">
              NEW
            </Badge>
          </div>
        </li>
      </ul>

      {/* Action Button */}
      <Button 
        onClick={() => onSubscribe(tier.name)}
        className={cn(
          "w-full mt-4",
          isEmperor && "bg-yellow-500 hover:bg-yellow-600 text-black",
          isCreator && "bg-orange-500 hover:bg-orange-600",
          isBusiness && "bg-purple-500 hover:bg-purple-600"
        )}
        variant={currentTierId === tier.id ? "secondary" : "default"}
        disabled={currentTierId === tier.id}
      >
        {currentTierId === tier.id ? 'Current Plan' : 'Subscribe'}
      </Button>
    </Card>
  );
};
