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

  const content = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2",
        active && "bg-accent",
        className
      )}
      onClick={handleClick}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {badge !== undefined && (
        <Badge variant="secondary" className="ml-auto">
          {badge}
        </Badge>
      )}
    </Button>
  );

  if (description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};