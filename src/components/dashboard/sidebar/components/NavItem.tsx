
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  path?: string;
  active?: boolean;
  premium?: boolean;
  badge?: number;
  description?: string;
  className?: string;
  subscription?: any;
  collapsed?: boolean;
  onClick?: () => void;
  onNavigate: (path?: string) => void;
}

export const NavItem = ({
  icon: Icon,
  label,
  path,
  active,
  premium,
  badge,
  description,
  className,
  subscription,
  collapsed,
  onClick,
  onNavigate
}: NavItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (path) {
      onNavigate(path);
    }
  };

  const button = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 relative group transition-all duration-300",
        "hover:bg-white/5 hover:backdrop-blur-lg",
        active && "bg-accent text-white neon-border-strong",
        !active && "hover:text-accent",
        collapsed && "justify-center px-2",
        "overflow-hidden",
        className
      )}
      onClick={handleClick}
    >
      {/* Glowing background effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
        "bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5",
        "blur-xl"
      )} />
      
      {/* Icon with glow effect */}
      <div className={cn(
        "relative z-10 transition-transform group-hover:scale-110",
        active && "text-white"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      
      {/* Label */}
      {!collapsed && (
        <span className="relative z-10">{label}</span>
      )}
      
      {/* Badge */}
      {!collapsed && badge !== undefined && (
        <Badge variant="secondary" className="ml-auto relative z-10">
          {badge}
        </Badge>
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="bg-black/80 backdrop-blur-lg border-white/10">
          <p>{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {badge !== undefined && <Badge variant="secondary">{badge}</Badge>}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent className="bg-black/80 backdrop-blur-lg border-white/10">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
};
