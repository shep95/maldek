import { Home, MessageCircle, Bell, Video, User, Settings, LogOut, Plus, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  premium?: boolean;
}

export const Sidebar = ({ setIsCreatingPost }: { setIsCreatingPost: (value: boolean) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // In a real app, this would come from your auth context/state
  const userProfilePic = "https://github.com/shadcn.png";
  const userInitials = "CN";

  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Logout successful");
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const navItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard", 
      active: location.pathname === "/dashboard" 
    },
    { 
      icon: MessageCircle, 
      label: "Messages", 
      path: "/messages", 
      active: location.pathname === "/messages" 
    },
    { 
      icon: Bell, 
      label: "Notifications", 
      path: "/notifications", 
      active: location.pathname === "/notifications" 
    },
    { 
      icon: Video, 
      label: "Videos", 
      path: "/videos", 
      active: location.pathname === "/videos" 
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/profile",
      active: location.pathname === "/profile"
    },
    { icon: TrendingUp, label: "Analytics" },
    { 
      icon: DollarSign, 
      label: "Premium", 
      premium: true,
      className: "text-accent"
    },
    { 
      icon: Plus, 
      label: "Create Post",
      onClick: () => setIsCreatingPost(true),
      className: "border-2 border-white hover:bg-accent/90 text-white"
    },
    { icon: Settings, label: "Settings" },
    { 
      icon: LogOut, 
      label: "Logout", 
      onClick: handleLogout
    },
  ];

  const handleNavigation = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="hidden md:block fixed left-0 h-screen p-4">
      <Card className="h-[90vh] w-64 flex flex-col justify-between border-muted bg-[#0d0d0d] backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-accent">Maldek</h2>
            <Avatar className="h-8 w-8 ring-2 ring-accent/50 ring-offset-2 ring-offset-background">
              <AvatarImage src={userProfilePic} alt="Profile" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </div>

          <ScrollArea className="h-[calc(100vh-12rem)]">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all",
                    item.active && "bg-accent/10 text-accent",
                    item.premium && "text-accent font-medium",
                    item.className
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {item.premium && (
                    <span className="ml-auto text-xs opacity-70">$8/mo</span>
                  )}
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
};