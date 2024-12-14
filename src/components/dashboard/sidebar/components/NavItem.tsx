import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
  onNavigate
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
            <Check className={cn(
              "h-4 w-4",
              subscription.tier.name === "Creator" && "text-orange-500",
              subscription.tier.name === "Business" && "text-yellow-500"
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
        <span className="ml-2 text-xs whitespace-nowrap shrink-0">From $8/mo</span>
      )}
    </Button>
  );
};