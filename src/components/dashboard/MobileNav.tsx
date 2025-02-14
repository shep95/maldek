
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, User, Bell, Menu, Upload } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState, useRef, TouchEvent } from "react";
import { SidebarNav } from "./sidebar/SidebarNav";
import { toast } from "sonner";

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  action?: () => void;
}

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX.current;
    if (swipeDistance > SWIPE_THRESHOLD) {
      setIsOpen(true);
    }
    touchStartX.current = null;
  };

  const handleNavigation = (path?: string, action?: () => void) => {
    try {
      if (action) {
        setIsOpen(false);
        action();
        return;
      }

      if (!path || location.pathname === path) {
        console.log('Already on path or no path provided:', path);
        setIsOpen(false);
        return;
      }

      console.log('Mobile navigation: Navigating to', path);
      setIsOpen(false);
      navigate(path);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error("Navigation failed. Please try again.");
    }
  };

  const handleCreatePost = () => {
    console.log('Opening create post dialog from mobile nav');
    setIsOpen(false);
    if (window.setIsCreatingPost) {
      window.setIsCreatingPost(true);
    }
  };

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: User, label: "User Info", path: "/followers" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Upload, label: "Create Post", action: handleCreatePost },
  ];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="w-72 p-0 bg-background mt-4 mb-20 mx-2 rounded-xl border border-border/50 shadow-xl"
        >
          <div className="flex h-full w-full flex-col py-6 pb-24">
            <SidebarNav 
              setIsCreatingPost={(value) => {
                console.log('Mobile SidebarNav setIsCreatingPost called with:', value);
                setIsOpen(false);
                if (window.setIsCreatingPost) {
                  window.setIsCreatingPost(value);
                }
              }}
              onSidebarClose={() => setIsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-0 md:hidden pointer-events-none"
      />

      <nav className="fixed bottom-6 left-4 right-4 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center bg-black/40 backdrop-blur-md rounded-lg border border-white/10 p-2 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="text-muted-foreground active:scale-95 transition-transform"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="icon"
              onClick={() => handleNavigation(item.path, item.action)}
              className={cn(
                "text-muted-foreground",
                "active:scale-95 transition-transform",
                "touch-manipulation select-none",
                "min-w-[44px] min-h-[44px]",
                item.path && location.pathname === item.path && "text-accent bg-accent/10"
              )}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </nav>
    </>
  );
};
