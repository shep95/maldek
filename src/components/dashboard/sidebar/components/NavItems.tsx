
import { Calendar, Home, Bell, Video, Settings, LogOut, Plus, TrendingUp, BrainCircuit, Users, User, BarChart2, Layers, Bot, Lock, MessagesSquare, WalletCards, Coins, Mail, Mic, ExternalLink, DollarSign, Zap } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom";
import { NavItem } from "./NavItem";
import { useNotificationCount } from "../hooks/useNotificationCount";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMessageNotificationCount } from "@/hooks/useMessageNotificationCount";
import { useState } from "react";
import { RothLordDialog } from "./RothLordDialog";

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
  const unreadMessageCount = useMessageNotificationCount();
  const isMobile = useIsMobile();
  const session = useSession();
  const navigate = useNavigate();
  const [isRothLordDialogOpen, setIsRothLordDialogOpen] = useState(false);

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

  const handleRothLordClick = () => {
    setIsRothLordDialogOpen(true);
  };

  // Check if today is August 26th
  const today = new Date();
  const isAugust26 = today.getMonth() === 7 && today.getDate() === 26; // Month is 0-indexed, so August is 7

  const hasPremiumFeatures = true;

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
      icon: MessagesSquare, 
      label: "Messages", 
      path: "/messages", 
      active: location.pathname === "/messages",
      description: "View your messages",
      badge: unreadMessageCount > 0 ? unreadMessageCount : undefined
    },
    {
      icon: Zap,
      label: "Zuko",
      path: "/zuko",
      active: location.pathname === "/zuko",
      description: "Zuko AI Assistant",
      className: "text-accent hover:bg-accent/10"
    },
    { 
      icon: Video, 
      label: "Videos", 
      path: "/videos", 
      active: location.pathname === "/videos" 
    },
    // {
    //   icon: Mic,
    //   label: "Spaces",
    //   path: "/spaces",
    //   active: location.pathname === "/spaces",
    //   description: "Join audio spaces",
    //   className: "text-accent hover:bg-accent/10"
    // },
    {
      icon: TrendingUp,
      label: "Trending",
      path: "/followers",
      active: location.pathname === "/followers",
      description: "Discover trending users"
    },
    { 
      icon: BarChart2, 
      label: "Analytics",
      path: "/analytics",
      active: location.pathname === "/analytics"
    },
    {
      icon: Coins,
      label: "Bosley Coin",
      path: "/bosley-coin",
      active: location.pathname === "/bosley-coin",
      description: "Meme coin analytics",
      className: "text-accent hover:bg-accent/10"
    },
    {
      icon: WalletCards,
      label: "Subscription",
      path: "/subscription",
      active: location.pathname === "/subscription",
      description: "Manage your subscription",
      className: "text-accent hover:bg-accent/10"
    },
    {
      icon: Lock,
      label: "Privacy",
      path: "/privacy",
      active: location.pathname === "/privacy",
      description: "Access private posts",
      className: "text-accent hover:bg-accent/10"
    },
    {
      icon: DollarSign,
      label: "RothLord",
      onClick: handleRothLordClick,
      description: "Financial AI Assistant",
      className: "text-accent hover:bg-accent/10"
    },
    { 
      icon: Mail, 
      label: "Support",
      path: "/support",
      active: location.pathname === "/support",
      description: "Get help with your account"
    },
    { 
      icon: Plus, 
      label: "Create Post",
      onClick: handleCreatePost,
      className: "border-none",
      useStarBorder: false
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/settings" 
    },
    { 
      icon: LogOut, 
      label: "Logout", 
      onClick: handleLogout
    },
  ];

  return (
    <>
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
      
      <RothLordDialog 
        open={isRothLordDialogOpen} 
        onOpenChange={setIsRothLordDialogOpen} 
      />
    </>
  );
};
