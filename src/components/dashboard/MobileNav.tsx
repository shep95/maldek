import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, MessageCircle, Bell, Video, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  icon: any;
  label: string;
  path: string;
}

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Video, label: "Videos", path: "/videos" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-muted p-2 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="icon"
            onClick={() => navigate(item.path)}
            className={cn(
              "text-muted-foreground",
              location.pathname === item.path && "text-accent"
            )}
          >
            <item.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    </nav>
  );
};