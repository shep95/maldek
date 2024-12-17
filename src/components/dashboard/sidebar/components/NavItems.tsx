import { Home, MessageCircle, Bell, Video, User, Settings, LogOut, Plus, TrendingUp, DollarSign, BrainCircuit } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useProfileNavigation } from "../utils/profileUtils";
import { NavItem } from "./NavItem";
import { useNotificationCount } from "../hooks/useNotificationCount";

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
  const { profilePath } = useProfileNavigation();
  const unreadCount = useNotificationCount(userId);

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
      badge: unreadCount > 0 ? unreadCount : undefined
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
    <nav className="space-y-2">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          {...item}
          subscription={subscription}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
};