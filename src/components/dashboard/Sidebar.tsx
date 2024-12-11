import { Home, MessageCircle, Bell, Video, User, Settings, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface NavItem {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Sidebar = ({ setIsCreatingPost }: { setIsCreatingPost: (value: boolean) => void }) => {
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", active: true },
    { icon: MessageCircle, label: "Messages" },
    { icon: Bell, label: "Notifications" },
    { icon: Video, label: "Videos" },
    { icon: User, label: "Profile" },
    { 
      icon: Plus, 
      label: "Create Post",
      onClick: () => setIsCreatingPost(true),
      className: "bg-accent hover:bg-accent/90 text-white"
    },
  ];

  const bottomNavItems: NavItem[] = [
    { icon: Settings, label: "Settings" },
    { 
      icon: LogOut, 
      label: "Logout", 
      onClick: () => {
        console.log("Logging out...");
        navigate("/auth");
      }
    },
  ];

  return (
    <div className="hidden md:block fixed left-0 h-screen p-4">
      <Card className="h-[90vh] w-64 flex flex-col justify-between border-muted bg-[#0d0d0d] backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-accent">Maldek</h2>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                onClick={item.onClick}
                className={cn(
                  "w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all",
                  item.active && "bg-accent/10 text-accent",
                  item.className
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 mt-auto border-t border-muted">
          <nav className="space-y-2">
            {bottomNavItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                onClick={item.onClick}
                className="w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </Card>
    </div>
  );
};