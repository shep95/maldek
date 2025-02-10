
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { CreatePostDialog } from "./CreatePostDialog";
import { useSession } from '@supabase/auth-helpers-react';
import { Author } from "@/utils/postUtils";
import { RightSidebar } from "./RightSidebar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    setIsCreatingPost: (value: boolean) => void;
  }
}

const DashboardLayout = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSettingSecurityCode, setIsSettingSecurityCode] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const session = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  // Make setIsCreatingPost available globally for the mobile nav
  window.setIsCreatingPost = setIsCreatingPost;

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: session?.user?.email?.split('@')[0] || '',
    avatar_url: '',
    name: session?.user?.email?.split('@')[0] || ''
  };

  // Check if user needs to set security code (only if they don't have one)
  useEffect(() => {
    const checkSecurityCode = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('security_code')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking security code:', error);
          return;
        }

        // Only show dialog if security_code is null
        if (!data?.security_code) {
          setIsSettingSecurityCode(true);
        }
      }
    };

    checkSecurityCode();
  }, [session?.user?.id]);

  const handleSetSecurityCode = async () => {
    if (securityCode.length !== 4 || !/^\d{4}$/.test(securityCode)) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ security_code: securityCode })
        .eq('id', session?.user?.id);

      if (error) throw error;
      
      setIsSettingSecurityCode(false);
      toast.success("Security code set successfully");
    } catch (error) {
      console.error('Error setting security code:', error);
      toast.error("Failed to set security code");
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts if not typing in an input or textarea
      if (event.target instanceof HTMLElement && 
          (event.target.tagName === 'INPUT' || 
           event.target.tagName === 'TEXTAREA')) {
        return;
      }

      // Check if shift key is pressed
      if (event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'p':
            event.preventDefault();
            console.log('Create post shortcut triggered');
            setIsCreatingPost(true);
            break;
          case 'v':
            event.preventDefault();
            console.log('Navigate to videos shortcut triggered');
            navigate('/videos');
            break;
          case 'n':
            event.preventDefault();
            console.log('Navigate to notifications shortcut triggered');
            navigate('/notifications');
            break;
          case 's':
            event.preventDefault();
            console.log('Navigate to settings shortcut triggered');
            navigate('/settings');
            break;
          case 'l':
            event.preventDefault();
            console.log('Logout shortcut triggered');
            handleLogout();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar setIsCreatingPost={setIsCreatingPost} />
        <div className={cn(
          "flex-1 transition-all duration-200 pb-24 md:pb-0",
          "md:ml-64",
          location.pathname === '/dashboard' && "lg:mr-80"
        )}>
          <main className="min-h-screen pb-20 md:pb-0 px-4 md:px-8 pt-safe pb-safe">
            <div className="max-w-3xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
        {location.pathname === '/dashboard' && <RightSidebar />}
      </div>
      <CreatePostDialog
        isOpen={isCreatingPost}
        onOpenChange={(open) => {
          console.log('Dialog open state changing to:', open);
          setIsCreatingPost(open);
        }}
        currentUser={currentUser}
        onPostCreated={(newPost) => {
          console.log('New post created:', newPost);
          setIsCreatingPost(false);
        }}
      />
      <MobileNav />

      {/* Initial Security Code Setup Dialog */}
      <Dialog 
        open={isSettingSecurityCode} 
        onOpenChange={setIsSettingSecurityCode}
        modal={true}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your Security Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Create your security code. You can only use 4 digits and they must be numbers.
              <br /><br />
              <span className="font-bold text-destructive">
                Warning: If you lose your code, you will lose access to your account.
              </span>
            </p>
            <Input
              type="password"
              placeholder="Enter 4-digit code"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              maxLength={4}
              pattern="\d{4}"
              required
              className="text-center text-2xl tracking-widest"
            />
            <Button 
              onClick={handleSetSecurityCode} 
              className="w-full"
              disabled={securityCode.length !== 4 || !/^\d{4}$/.test(securityCode)}
            >
              Set Security Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardLayout;
