import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Home, MessageCircle, Bell, Video, User, Settings, LogOut, Plus, TrendingUp, DollarSign, Check, BrainCircuit } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
      try {
        console.log("Fetching user subscription data...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found");
          return null;
        }

        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            tier:subscription_tiers(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        if (error) {
          console.error("Error fetching subscription:", error);
          return null;
        }

        console.log("Subscription data:", subscription);
        return subscription;
      } catch (error) {
        console.error("Error in subscription query:", error);
        return null;
      }
    }
  });

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });
      
      navigate("/auth");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log("Logout error:", error);
        toast.success("Logged out successfully");
        return;
      }
      
      console.log("Logout successful");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.success("Logged out successfully");
    }
  };

  const handlePremiumClick = () => {
    navigate('/subscription');
    toast.info(subscription ? 'Viewing your subscription' : 'Explore premium features');
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
      icon: BrainCircuit,
      label: "Daarp AI",
      path: "/daarp-ai",
      active: location.pathname === "/daarp-ai",
      premium: true,
      description: subscription ? "Chat with AI assistant" : "Unlock AI features",
      className: "text-accent"
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
      onClick: handlePremiumClick,
      description: subscription ? (
        `${subscription.mentions_remaining} mentions remaining`
      ) : (
        "Unlock premium features"
      ),
      className: cn(
        "text-accent relative hover:bg-accent/10",
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
    { icon: Settings, label: "Settings", path: "/settings" },
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
    <ScrollArea className="h-full px-2 py-2">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            onClick={() => handleNavigation(item)}
            className={cn(
              "w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all",
              "text-sm font-medium",
              "min-h-[2.5rem] py-2 px-3",
              item.active && "bg-accent/10 text-accent",
              item.premium && "text-accent font-medium",
              item.className
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <div className="flex flex-col items-start text-left min-w-0 flex-1">
              <span className="flex items-center gap-2 truncate w-full">
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
                <span className="text-xs text-muted-foreground truncate w-full">
                  {item.description}
                </span>
              )}
            </div>
            {item.premium && !subscription && (
              <span className="ml-2 text-xs whitespace-nowrap shrink-0">From $8/mo</span>
            )}
          </Button>
        ))}
      </nav>
    </ScrollArea>
  );
};