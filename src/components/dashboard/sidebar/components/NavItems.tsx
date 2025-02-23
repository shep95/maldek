
import { Calendar, Home, Bell, Video, Settings, LogOut, Plus, TrendingUp, DollarSign, BrainCircuit, Users, LayoutGrid, Crown, User, BarChart2, Layers, Bot } from "lucide-react"
import { useLocation } from "react-router-dom";
import { NavItem } from "./NavItem";
import { useNotificationCount } from "../hooks/useNotificationCount";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NavItemsProps {
  subscription: any;
  userId: string | null;
  handlePremiumClick: () => void;
  handleLogout: () => void;
  setIsCreatingPost: (value: boolean) => void;
  onNavigate: (path?: string) => void;
  collapsed?: boolean;
}

export const NavItems = ({
  subscription,
  userId,
  handlePremiumClick,
  handleLogout,
  setIsCreatingPost,
  onNavigate,
  collapsed
}: NavItemsProps) => {
  const location = useLocation();
  const unreadCount = useNotificationCount(userId);
  const isMobile = useIsMobile();
  const session = useSession();

  const isFebruary28th2025 = () => {
    const now = new Date();
    return now.getFullYear() === 2025 && 
           now.getMonth() === 1 && // February is 1 (0-based months)
           now.getDate() === 28;
  };

  const handleNavigation = (path?: string) => {
    if (isMobile) {
      const mobileSheet = document.querySelector('[data-mobile="true"]');
      if (mobileSheet) {
        const closeButton = mobileSheet.querySelector('button[aria-label="Close"]') as HTMLButtonElement | null;
        if (closeButton) {
          closeButton.click();
        }
      }
    }
    if (path?.startsWith('http')) {
      if (path === 'https://www.zukoi.app' && !isFebruary28th2025()) {
        return; // Do nothing if it's not February 28th, 2025
      }
      window.open(path, '_blank');
    } else {
      onNavigate(path);
    }
  };

  const handleCreatePost = () => {
    console.log('Create post clicked');
    setIsCreatingPost(true);
  };

  const navItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard", 
      active: location.pathname === "/dashboard" 
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/profiles",
      active: location.pathname === "/profiles",
      description: "View your profile"
    },
    { 
      icon: Bell, 
      label: "Notifications", 
      path: "/notifications", 
      active: location.pathname === "/notifications",
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { 
      icon: Video, 
      label: "Videos", 
      path: "/videos", 
      active: location.pathname === "/videos" 
    },
    {
      icon: Users,
      label: "Followers",
      path: "/followers",
      active: location.pathname === "/followers",
      description: "Manage followers"
    },
    {
      icon: LayoutGrid,
      label: "Spaces",
      path: "/spaces",
      active: location.pathname === "/spaces",
      description: "Join community spaces"
    },
    { 
      icon: TrendingUp, 
      label: "Analytics",
      path: "/analytics",
      active: location.pathname === "/analytics"
    },
    {
      icon: Layers,
      label: "Our Features",
      path: "/features",
      active: location.pathname === "/features",
      description: "Learn about our platform features",
      className: "text-accent hover:bg-accent/10"
    },
    {
      icon: Bot,
      label: "ZUKO AI",
      path: "https://www.zukoi.app",
      description: isFebruary28th2025() ? "Visit ZUKO AI" : "Available on February 28th, 2025",
      className: isFebruary28th2025() ? "text-accent hover:bg-accent/10" : "text-muted-foreground cursor-not-allowed opacity-50"
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
      className: subscription?.tier?.name === "True Emperor" ? "text-yellow-500" : 
                 subscription?.tier?.name === "Creator" ? "text-white" : 
                 "text-accent relative hover:bg-accent/10"
    },
    { 
      icon: Plus, 
      label: "Create Post",
      onClick: handleCreatePost,
      className: "border-2 border-white hover:bg-accent/90 text-white"
    },
    { icon: Settings, label: "Settings", path: "/settings" },
    { 
      icon: LogOut, 
      label: "Logout", 
      onClick: handleLogout
    },
    {
      icon: Crown,
      label: "Emperor Chat",
      path: "/emperor-chat",
      active: location.pathname === "/emperor-chat",
      premium: true,
      description: subscription?.tier?.name === "True Emperor" ? "Exclusive Emperor Chatroom" : "Unlock Emperor features",
      className: subscription?.tier?.name === "True Emperor" ? "text-yellow-500" : "text-accent"
    },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          {...item}
          subscription={subscription}
          onNavigate={handleNavigation}
          collapsed={collapsed}
        />
      ))}
    </nav>
  );
};
