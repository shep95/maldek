import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, MessageCircle, Bell, Video, User } from "lucide-react";

interface NavItem {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const MobileNav = () => {
  const navItems: NavItem[] = [
    { icon: Home, label: "Home", active: true },
    { icon: MessageCircle, label: "Messages" },
    { icon: Bell, label: "Notifications" },
    { icon: Video, label: "Videos" },
    { icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-muted p-2 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="icon"
            onClick={item.onClick}
            className={cn(
              "text-muted-foreground",
              item.active && "text-accent"
            )}
          >
            <item.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    </nav>
  );
};