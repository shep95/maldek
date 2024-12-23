import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, DollarSign, Mic, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionTierProps {
  tier: any;
  currentTierId?: string;
  onSubscribe: (tier: string) => void;
}

export const SubscriptionTierCard = ({ tier, currentTierId, onSubscribe }: SubscriptionTierProps) => {
  const isEmperor = tier.name === 'True Emperor';
  const uploadLimit = isEmperor ? '10TB' : 
    tier.max_upload_size_mb >= 1024 
      ? `${(tier.max_upload_size_mb / 1024).toFixed(0)}GB`
      : `${tier.max_upload_size_mb}MB`;

  return (
    <Card className={cn(
      "p-6 flex flex-col",
      isEmperor && "border-yellow-500/50 bg-black/40"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={cn(
          "text-2xl font-bold",
          isEmperor && "text-yellow-500 flex items-center gap-2"
        )}>
          {tier.name}
          {isEmperor && <Crown className="h-6 w-6 text-yellow-500" />}
        </h2>
        <Badge variant="secondary" className={cn(
          "bg-orange-500/10 text-orange-500",
          isEmperor && "bg-yellow-500/10 text-yellow-500"
        )}>
          {isEmperor ? 'EXCLUSIVE' : 'Beta'}
        </Badge>
      </div>
      <p className="text-4xl font-bold mb-6">
        ${isEmperor ? '50,000' : tier.price}<span className="text-sm">/month</span>
      </p>
      <ul className="space-y-3 mb-8">
        <li className="flex items-center">
          <Check className="mr-2 h-5 w-5 text-green-500" />
          {tier.monthly_mentions} mentions per month
        </li>
        <li className="flex items-center">
          <Check className="mr-2 h-5 w-5 text-green-500" />
          Upload files up to {uploadLimit}
        </li>
        <li className="flex items-center">
          <Check className="mr-2 h-5 w-5 text-green-500" />
          {isEmperor ? 'Gold' : tier.name === 'Creator' ? 'Orange' : 'Purple'} checkmark
        </li>
        {isEmperor && (
          <>
            <li className="flex items-center">
              <Crown className="mr-2 h-5 w-5 text-yellow-500" />
              Gold name highlight in posts & comments
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              Unlimited pinned posts
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              {tier.post_character_limit.toLocaleString()} character limit
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              Schedule posts up to {tier.schedule_days_limit} days ahead
            </li>
            <li className="flex items-center">
              <Mic className="mr-2 h-5 w-5 text-yellow-500" />
              <span className="flex items-center gap-2">
                Exclusive Emperor Chatroom
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-xs">
                  EXCLUSIVE
                </Badge>
              </span>
            </li>
          </>
        )}
        <li className="flex items-center">
          <Check className="mr-2 h-5 w-5 text-green-500" />
          Priority support
        </li>
        <li className="flex items-center">
          <Check className="mr-2 h-5 w-5 text-green-500" />
          <span className="flex items-center gap-2">
            {isEmperor ? 'Custom Analytics Dashboard Builder' : 'Advanced Analytics Dashboard'}
            <Badge variant="secondary" className={cn(
              "bg-orange-500/10 text-orange-500 text-xs",
              isEmperor && "bg-yellow-500/10 text-yellow-500"
            )}>
              {isEmperor ? 'EMPEROR' : 'PRO'}
            </Badge>
          </span>
        </li>
        <li className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-orange-500" />
          <span>
            Payouts (Beta Testing)
          </span>
        </li>
        <li className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-orange-500" />
          <span className="flex items-center gap-2">
            DAARP AI (BETA)
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 text-xs">
              NEW
            </Badge>
          </span>
        </li>
      </ul>
      <Button 
        onClick={() => onSubscribe(tier.name)}
        className={cn(
          "mt-auto",
          isEmperor && "bg-yellow-500 hover:bg-yellow-600 text-black"
        )}
        variant={currentTierId === tier.id ? "secondary" : "default"}
        disabled={currentTierId === tier.id}
      >
        {currentTierId === tier.id ? 'Current Plan' : 'Subscribe'}
      </Button>
    </Card>
  );
};