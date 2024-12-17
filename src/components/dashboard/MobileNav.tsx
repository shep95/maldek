import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, MessageCircle, Bell, Video, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState, useRef, TouchEvent } from "react";
import { SidebarNav } from "./sidebar/SidebarNav";
import { toast } from "sonner";

interface NavItem {
  icon: any;
  label: string;
  path: string;
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

  const handleNavigation = (path: string) => {
    try {
      if (location.pathname === path) {
        console.log('Already on path:', path);
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

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Video, label: "Videos", path: "/videos" },
  ];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-[#0d0d0d]">
          <SidebarNav 
            setIsCreatingPost={(value) => {
              console.log('Mobile SidebarNav setIsCreatingPost called with:', value);
              setIsOpen(false);
              if (window.setIsCreatingPost) {
                window.setIsCreatingPost(value);
              }
            }} 
          />
        </SheetContent>
      </Sheet>

      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-0 md:hidden pointer-events-none"
      />

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-muted p-2 md:hidden z-50">
        <div className="flex justify-around items-center">
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
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "text-muted-foreground",
                "active:scale-95 transition-transform",
                "touch-manipulation select-none",
                "min-w-[44px] min-h-[44px]",
                location.pathname === item.path && "text-accent bg-accent/10"
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