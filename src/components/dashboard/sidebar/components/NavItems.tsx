
import { Calendar, Home, Bell, Video, Settings, LogOut, Plus, TrendingUp, DollarSign, BrainCircuit, Users, LayoutGrid, Crown, User, BarChart2, Layers, Bot, Lock } from "lucide-react"
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
      window.open(path, '_blank');
    } else {
      onNavigate(path);
    }
  };

  const handleCreatePost = () => {
    console.log('Create post clicked');
    setIsCreatingPost(true);
  };

  const hasPremiumSubscription = !!subscription?.tier?.name;
  const hasEmperorAccess = subscription?.tier?.name === "True Emperor" || subscription?.is_lifetime === true || session?.user?.email === "jeremy@nftdemon.com";

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
    ...(hasPremiumSubscription ? [{
      icon: Lock,
      label: "Privacy",
      path: "/profiles",
      active: location.pathname === "/profiles",
      description: "Access private posts",
      className: "text-accent hover:bg-accent/10"
    }] : []),
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
      description: "Visit ZUKO AI",
      className: "text-accent hover:bg-accent/10"
    },
    { 
      icon: DollarSign, 
      label: subscription?.tier?.name || "Premium", 
      premium: true,
      onClick: handlePremiumClick,
      description: session?.user?.email === "jeremy@nftdemon.com" ? 
        "Premium $80,000 Emperor Subscription" : 
        subscription ? (
          `${subscription.mentions_remaining} mentions remaining`
        ) : (
          "Unlock premium features"
        ),
      className: subscription?.tier?.name === "True Emperor" || subscription?.is_lifetime === true || session?.user?.email === "jeremy@nftdemon.com" ? 
                "text-yellow-500" : 
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
      description: hasEmperorAccess ? "Exclusive Emperor Chatroom" : "Unlock Emperor features",
      className: hasEmperorAccess ? "text-yellow-500" : "text-accent"
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
