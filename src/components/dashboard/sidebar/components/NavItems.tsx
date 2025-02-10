import { Calendar, Home, Bell, Video, Settings, LogOut, Plus, TrendingUp, DollarSign, BrainCircuit, Users, LayoutGrid, Crown, User, BarChart2 } from "lucide-react"
import { useLocation } from "react-router-dom";
import { NavItem } from "./NavItem";
import { useNotificationCount } from "../hooks/useNotificationCount";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
      icon: User, 
      label: "User Info", 
      path: "/followers", 
      active: location.pathname === "/followers",
      description: "View user profiles"
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
      className: "text-accent hover:text-accent/80"
    },
    { 
      icon: TrendingUp, 
      label: "Analytics",
      path: "/analytics",
      active: location.pathname === "/analytics"
    },
    {
      icon: BarChart2,
      label: "Advertisement",
      path: "/advertisement",
      active: location.pathname === "/advertisement",
      description: "Manage your ads"
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
        subscription?.tier?.name === "Creator" ? "text-orange-500 hover:text-orange-600" : 
        subscription?.tier?.name === "Business" ? "text-yellow-500 hover:text-yellow-600" : 
        "text-accent hover:text-accent/80 relative hover:bg-accent/10"
      )
    },
    { 
      icon: Plus, 
      label: "Create Post",
      onClick: handleCreatePost,
      className: "border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90"
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/settings",
      active: location.pathname === "/settings"
    },
    { 
      icon: LogOut, 
      label: "Logout", 
      onClick: handleLogout,
      className: "text-muted-foreground hover:text-foreground"
    },
    {
      icon: Crown,
      label: "Emperor Chat",
      path: "/emperor-chat",
      active: location.pathname === "/emperor-chat",
      premium: true,
      description: subscription?.tier?.name === "True Emperor" ? "Exclusive Emperor Chatroom" : "Unlock Emperor features",
      className: subscription?.tier?.name === "True Emperor" ? "text-yellow-500 hover:text-yellow-600" : "text-accent hover:text-accent/80"
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
