
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, Mic, BarChart2, Download, Image, Lock, Clock, MessageSquare, Trophy, Sparkles, FileVideo } from "lucide-react";
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
    return price % 1 === 0 ? price.toLocaleString() : price.toFixed(2);
  };

  // Define the order of features
  const renderFeatures = () => {
    const features = [];

    // Premium Badge
    features.push(
      <li key="badge" className="flex items-center gap-3">
        <Crown className={cn(
          "h-5 w-5",
          isEmperor ? "text-yellow-500" : isCreator ? "text-white" : ""
        )} />
        <span>{isEmperor ? 'Gold Crown Badge' : 'Premium Badge'}</span>
      </li>
    );

    // Premium Features (for both Creator and Emperor)
    if (isPremium) {
      features.push(
        <li key="gif" className="flex items-center gap-3">
          <Image className="h-5 w-5 text-accent" />
          <span>GIF Upload Support</span>
        </li>,
        <li key="animated" className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-accent" />
          <span>Animated Avatar Support</span>
        </li>,
        <li key="nft" className="flex items-center gap-3">
          <Image className="h-5 w-5 text-accent" />
          <span>NFT Avatar Support</span>
        </li>,
        <li key="watermark" className="flex items-center gap-3">
          <Image className="h-5 w-5 text-accent" />
          <span>No Watermark on Media</span>
        </li>
      );
    }

    // Standard Features
    features.push(
      <li key="mentions" className="flex items-center gap-3">
        <Check className="h-5 w-5 text-green-500" />
        <span>{tier.monthly_mentions.toLocaleString()} mentions per month</span>
      </li>,
      <li key="upload" className="flex items-center gap-3">
        <FileVideo className="h-5 w-5 text-accent" />
        <span>Upload files up to {tier.max_upload_size_mb}MB</span>
      </li>,
      <li key="char-limit" className="flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-accent" />
        <span>{tier.post_character_limit?.toLocaleString()} character limit</span>
      </li>,
      <li key="schedule" className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-accent" />
        <span>Schedule posts up to {tier.schedule_days_limit} days ahead</span>
      </li>,
      <li key="pin" className="flex items-center gap-3">
        <Trophy className="h-5 w-5 text-accent" />
        <span>Pin up to {tier.max_pinned_posts} {tier.max_pinned_posts === 1 ? 'post' : 'posts'}</span>
      </li>
    );

    // Base Features
    features.push(
      <li key="download" className="flex items-center gap-3">
        <Download className="h-5 w-5 text-white" />
        <span>Download videos and images</span>
      </li>,
      <li key="spaces" className="flex items-center gap-3">
        <Mic className="h-5 w-5 text-white" />
        <div className="flex items-center gap-2">
          <span>Access to Spaces</span>
          <Badge variant="secondary" className="bg-white/10 text-white text-xs">
            BETA
          </Badge>
        </div>
      </li>,
      <li key="analytics" className="flex items-center gap-3">
        <BarChart2 className="h-5 w-5 text-white" />
        <div className="flex items-center gap-2">
          <span>Advanced Analytics Dashboard</span>
          <Badge variant="secondary" className="bg-white/10 text-white text-xs">
            PRO
          </Badge>
        </div>
      </li>
    );

    // Emperor-only features
    if (isEmperor) {
      features.push(
        <li key="emperor-chat" className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-yellow-500" />
          <div className="flex items-center gap-2">
            <span>Emperor Chatroom Access</span>
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-xs">
              VIP
            </Badge>
          </div>
        </li>
      );
    }

    return features;
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
          {isEmperor ? 'One-Time' : 'Premium'}
        </Badge>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">${formatPrice(tier.price)}</span>
        {!isEmperor && <span className="text-sm text-muted-foreground">/month</span>}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-4">
        {renderFeatures()}
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
