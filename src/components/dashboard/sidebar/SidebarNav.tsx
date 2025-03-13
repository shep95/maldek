
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

  // Since all features are free, we don't need to fetch subscription data anymore
  // But keeping the structure to avoid breaking other components
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

        // Always return a subscription object that indicates premium features are enabled
        return {
          tier_id: "premium",
          tier: {
            name: "Creator",
            monthly_mentions: 999999,
            max_upload_size_mb: 1024,
            supports_animated_avatars: true,
            supports_nft_avatars: true,
            watermark_disabled: true,
            max_pinned_posts: 10,
            post_character_limit: null // null means unlimited character limit
          },
          status: "active",
          mentions_remaining: 999999,
          is_lifetime: true
        };
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
    // Navigate to the features page when clicking Invest
    navigate('/features');
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
