import { Home, Bell, Video, Settings, LogOut, Plus, TrendingUp, DollarSign, BrainCircuit, Users, LayoutGrid, Crown, Users2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavItem } from "./NavItem";
import { useNotificationCount } from "../hooks/useNotificationCount";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemsProps {
  subscription: any;
  userId: string | null;
  handlePremiumClick: () => void;
  handleLogout: () => void;
  setIsCreatingPost: (value: boolean) => void;
  onNavigate: (path?: string) => void;
}

export const NavItems = ({
  subscription,
  userId,
  handlePremiumClick,
  handleLogout,
  setIsCreatingPost,
  onNavigate
}: NavItemsProps) => {
  const location = useLocation();
  const unreadCount = useNotificationCount(userId);
  const isMobile = useIsMobile();

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
    onNavigate(path);
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
      icon: Users2, 
      label: "Followers", 
      path: "/followers", 
      active: location.pathname === "/followers",
      description: "Find and follow users"
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
      label: "Profiles",
      path: "/profiles",
      active: location.pathname === "/profiles",
      description: "Browse user profiles"
    },
    {
      icon: LayoutGrid,
      label: "Spaces",
      path: "/spaces",
      active: location.pathname === "/spaces",
      description: "Join community spaces"
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
        />
      ))}
    </nav>
  );
};
