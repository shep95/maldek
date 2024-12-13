import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, MessageCircle, Bell, Video, User, Settings, LogOut, Plus, TrendingUp, DollarSign, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  premium?: boolean;
  description?: string;
}

export const SidebarNav = ({ setIsCreatingPost }: { setIsCreatingPost: (value: boolean) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user's subscription status
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', user.id)
        .single();

      return subscription;
    }
  });

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      
      // First clear all auth data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });
      
      // Force navigation to auth page
      navigate("/auth");
      
      // Attempt to sign out from Supabase after navigation
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log("Logout error:", error);
        // Even if there's an error, we've already cleared localStorage and redirected
        toast.success("Logged out successfully");
        return;
      }
      
      console.log("Logout successful");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, ensure the user is logged out locally
      toast.success("Logged out successfully");
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
    { 
      icon: TrendingUp, 
      label: "Analytics",
      path: "/analytics",
      active: location.pathname === "/analytics"
    },
    { 
      icon: DollarSign, 
      label: subscription?.tier?.name || "Premium", 
      premium: true,
      description: subscription ? (
        `${subscription.mentions_remaining} mentions remaining`
      ) : (
        "Unlock premium features"
      ),
      className: cn(
        "text-accent relative",
        subscription?.tier?.name === "Creator" && "text-orange-500",
        subscription?.tier?.name === "Business" && "text-yellow-500"
      )
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
            <div className="flex flex-col items-start text-left">
              <span className="flex items-center gap-2">
                {item.label}
                {item.premium && subscription?.tier && (
                  <Check className={cn(
                    "h-4 w-4",
                    subscription.tier.name === "Creator" && "text-orange-500",
                    subscription.tier.name === "Business" && "text-yellow-500"
                  )} />
                )}
              </span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
            {item.premium && !subscription && (
              <span className="ml-auto text-xs">From $8/mo</span>
            )}
          </Button>
        ))}
      </nav>
    </ScrollArea>
  );
};