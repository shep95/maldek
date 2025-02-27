
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { NavItems } from "./components/NavItems";
import { useEffect, useState } from "react";

interface SidebarNavProps {
  setIsCreatingPost: (value: boolean) => void;
  collapsed?: boolean;
  onSidebarClose?: () => void; // New prop for handling sidebar close
}

export const SidebarNav = ({ setIsCreatingPost, collapsed, onSidebarClose }: SidebarNavProps) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

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
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Error during logout");
        return;
      }
      
      console.log("Logout successful");
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };

  const handlePremiumClick = () => {
    navigate('/subscription');
    toast.info(subscription ? 'Viewing your subscription' : 'Explore premium features');
    if (onSidebarClose) onSidebarClose(); // Close sidebar after navigation
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      console.log('Navigating to:', path);
      navigate(path);
      if (onSidebarClose) onSidebarClose(); // Close sidebar after navigation
    }
  };

  // Fetch current user ID on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    
    fetchUserId();
  }, []);

  return (
    <ScrollArea className="h-full px-2 py-2">
      <NavItems
        subscription={subscription}
        userId={userId}
        handlePremiumClick={handlePremiumClick}
        handleLogout={handleLogout}
        setIsCreatingPost={(value) => {
          setIsCreatingPost(value);
          if (onSidebarClose) onSidebarClose(); // Close sidebar after creating post
        }}
        onNavigate={handleNavigation}
        collapsed={collapsed}
      />
    </ScrollArea>
  );
};

