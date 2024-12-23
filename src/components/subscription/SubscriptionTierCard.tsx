import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, DollarSign, Mic, Sparkles } from "lucide-react";

interface SubscriptionTierProps {
  tier: any;
  currentTierId?: string;
  onSubscribe: (tier: string) => void;
}

export const SubscriptionTierCard = ({ tier, currentTierId, onSubscribe }: SubscriptionTierProps) => {
  const uploadLimit = tier.max_upload_size_mb >= 1024 
    ? `${(tier.max_upload_size_mb / 1024).toFixed(0)}GB`
    : `${tier.max_upload_size_mb}MB`;

  return (
    <Card className="p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{tier.name}</h2>
        <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
          Beta
        </Badge>
      </div>
      <p className="text-4xl font-bold mb-6">${tier.price}<span className="text-sm">/month</span></p>
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
          {tier.name === 'Creator' ? 'Orange' : 'Gold'} checkmark
        </li>
        <li className="flex items-center">
          <Check className="mr-2 h-5 w-5 text-green-500" />
          Priority support
        </li>
        <li className="flex items-center">
          <Check className="mr-2 h-5 w-5 text-green-500" />
          <span className="flex items-center gap-2">
            Advanced Analytics Dashboard
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 text-xs">
              PRO
            </Badge>
          </span>
        </li>
        <li className="flex items-center">
          <Mic className="mr-2 h-5 w-5 text-orange-500" />
          <span className="flex items-center gap-2">
            Create Spaces
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 text-xs">
              HOT
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
        className="mt-auto"
        variant={currentTierId === tier.id ? "secondary" : "default"}
        disabled={currentTierId === tier.id}
      >
        {currentTierId === tier.id ? 'Current Plan' : 'Subscribe'}
      </Button>
    </Card>
  );
};