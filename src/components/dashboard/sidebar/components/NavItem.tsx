import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

interface NavItemProps {
  icon: any;
  label: string;
  path?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  premium?: boolean;
  description?: string;
  subscription?: any;
  onNavigate: (path?: string) => void;
  badge?: number;
}

export const NavItem = ({
  icon: Icon,
  label,
  path,
  active,
  onClick,
  className,
  premium,
  description,
  subscription,
  onNavigate,
  badge
}: NavItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      onNavigate(path);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={cn(
        "w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all",
        "text-sm font-medium",
        "min-h-[2.5rem] py-2 px-3",
        "relative",
        active && "bg-accent/10 text-accent",
        premium && "text-accent font-medium",
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex flex-col items-start text-left min-w-0 flex-1">
        <span className="flex items-center gap-2 truncate w-full">
          {label}
          {premium && subscription?.tier && (
            <Crown className={cn(
              "h-4 w-4",
              subscription.tier.name === "Creator" && "text-orange-500",
              subscription.tier.name === "Business" && "text-purple-500"
            )} />
          )}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground truncate w-full">
            {description}
          </span>
        )}
      </div>
      {premium && !subscription && (
        <span className="ml-2 text-xs whitespace-nowrap shrink-0">$17/mo</span>
      )}
      {badge && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[20px] h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center px-1.5">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Button>
  );
};