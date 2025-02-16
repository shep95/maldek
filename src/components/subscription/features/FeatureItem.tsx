
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FeatureItemProps {
  icon: LucideIcon;
  text: string;
  badge?: {
    text: string;
    variant: "beta" | "pro" | "vip";
  };
  iconColor?: string;
}

export const FeatureItem = ({ icon: Icon, text, badge, iconColor }: FeatureItemProps) => {
  const getBadgeStyles = (variant: string) => {
    switch (variant) {
      case "vip":
        return "bg-yellow-500/10 text-yellow-500";
      case "pro":
      case "beta":
      default:
        return "bg-white/10 text-white";
    }
  };

  return (
    <li className="flex items-center gap-3">
      <Icon className={cn("h-5 w-5", iconColor)} />
      <div className="flex items-center gap-2">
        <span>{text}</span>
        {badge && (
          <Badge 
            variant="secondary" 
            className={cn("text-xs", getBadgeStyles(badge.variant))}
          >
            {badge.text}
          </Badge>
        )}
      </div>
    </li>
  );
};
