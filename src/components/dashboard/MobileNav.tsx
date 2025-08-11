
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, User, Bell, Menu, Upload } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { useState, useRef, TouchEvent } from "react";
import { SidebarNav } from "./sidebar/SidebarNav";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
    
    // Open drawer on right swipe (left-to-right)
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
    { icon: Menu, label: "Menu" },
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

      {/* Swipe detection area covering the entire screen */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-0 md:hidden pointer-events-none"
      />

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-[200] bg-black/80 backdrop-blur-xl border-t border-white/20">
        <div className="flex justify-around items-center p-4 safe-area-bottom">
          {navItems.map((item, index) => (
            <Button
              key={item.label}
              variant="ghost"
              size="icon"
              onClick={() => index === 0 ? setIsOpen(true) : handleNavigation(item.path, item.action)}
              className={cn(
                "text-white/80 hover:text-white",
                "active:scale-95 transition-all duration-200",
                "touch-manipulation select-none",
                "min-w-[48px] min-h-[48px]",
                "hover:bg-white/10 rounded-lg",
                item.path && location.pathname === item.path && "text-accent bg-accent/20"
              )}
            >
              <item.icon className="h-6 w-6" />
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
