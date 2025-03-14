
import {
  Calendar,
  Home,
  Bell,
  Video,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  DollarSign,
  BrainCircuit,
  Users,
  LayoutGrid,
  Coins,
  User,
  Lock,
  Bot
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dock, DockItem, DockIcon, DockLabel } from "@/components/ui/dock";
import { useNotificationCount } from "../hooks/useNotificationCount";

interface DockNavigationProps {
  handleCreatePost: () => void;
  handleLogout: () => void;
  onNavigate: (path?: string) => void;
  userId: string | null;
}

export const DockNavigation = ({
  handleCreatePost,
  handleLogout,
  onNavigate,
  userId
}: DockNavigationProps) => {
  const location = useLocation();
  const unreadCount = useNotificationCount(userId);
  
  const navItems = [
    { 
      title: "Home", 
      icon: <Home className="h-full w-full text-accent" />,
      path: "/dashboard",
      active: location.pathname === "/dashboard"
    },
    { 
      title: "Profile", 
      icon: <User className="h-full w-full text-accent" />,
      path: "/profiles",
      active: location.pathname === "/profiles"
    },
    { 
      title: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, 
      icon: <Bell className="h-full w-full text-accent" />,
      path: "/notifications",
      active: location.pathname === "/notifications"
    },
    { 
      title: "Videos", 
      icon: <Video className="h-full w-full text-accent" />,
      path: "/videos",
      active: location.pathname === "/videos"
    },
    {
      title: "Followers",
      icon: <Users className="h-full w-full text-accent" />,
      path: "/followers",
      active: location.pathname === "/followers"
    },
    {
      title: "Spaces",
      icon: <LayoutGrid className="h-full w-full text-accent" />,
      path: "/spaces",
      active: location.pathname === "/spaces"
    },
    { 
      title: "Analytics", 
      icon: <TrendingUp className="h-full w-full text-accent" />,
      path: "/analytics",
      active: location.pathname === "/analytics"
    },
    {
      title: "Privacy",
      icon: <Lock className="h-full w-full text-accent" />,
      path: "/profiles",
      active: false
    },
    {
      title: "ZUKO AI",
      icon: <Bot className="h-full w-full text-accent" />,
      path: "https://www.zukoi.app",
      active: false
    },
    { 
      title: "Invest", 
      icon: <Coins className="h-full w-full text-accent" />,
      path: "/invest",
      active: location.pathname === "/invest"
    },
    { 
      title: "Create Post", 
      icon: <Plus className="h-full w-full text-white" />,
      action: handleCreatePost,
      active: false,
      className: "bg-accent"
    },
    { 
      title: "Settings", 
      icon: <Settings className="h-full w-full text-accent" />,
      path: "/settings",
      active: location.pathname === "/settings"
    },
    { 
      title: "Logout", 
      icon: <LogOut className="h-full w-full text-accent" />,
      action: handleLogout,
      active: false
    }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Dock 
        className="flex-col items-center gap-2 py-6 px-2 bg-background/20 backdrop-blur-md border border-border/50 shadow-lg rounded-lg h-full"
        panelHeight={600} 
        magnification={60}
        distance={100}
      >
        {navItems.map((item, idx) => {
          // Create a click handler inside the map function
          const handleItemClick = () => {
            if (item.action) {
              item.action();
            } else if (item.path) {
              onNavigate(item.path);
            }
          };

          return (
            <DockItem
              key={idx}
              className={`rounded-lg ${item.active ? 'bg-accent/10' : 'bg-background/40'} ${item.className || ''} cursor-pointer hover:bg-accent/20 transition-all duration-200`}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>
                <div 
                  onClick={handleItemClick}
                  className="w-full h-full p-1"
                >
                  {item.icon}
                </div>
              </DockIcon>
            </DockItem>
          );
        })}
      </Dock>
    </div>
  );
};
