import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, MessageCircle, Bell, Video, User, Settings, LogOut, Plus, TrendingUp, DollarSign, BrainCircuit } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { NavItem } from "./components/NavItem";
import { useProfileNavigation } from "./utils/profileUtils";

export const SidebarNav = ({ setIsCreatingPost }: { setIsCreatingPost: (value: boolean) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profilePath } = useProfileNavigation();

  // Fetch unread notifications count
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('read', false);

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching notification count:', error);
        return 0;
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

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
          .maybeSingle();

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

  const handleNavigation = (path?: string) => {
    if (path) {
      console.log('Navigating to:', path);
      navigate(path);
    }
  };

  const navItems = [
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
      active: location.pathname === "/notifications",
      badge: unreadCount && unreadCount > 0 ? unreadCount : undefined
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
      path: profilePath,
      active: location.pathname.startsWith('/profile')
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
      className: subscription?.tier?.name === "Creator" ? "text-orange-500" : 
                 subscription?.tier?.name === "Business" ? "text-yellow-500" : 
                 "text-accent relative hover:bg-accent/10"
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

  return (
    <ScrollArea className="h-full px-2 py-2">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            subscription={subscription}
            onNavigate={handleNavigation}
          />
        ))}
      </nav>
    </ScrollArea>
  );
};
