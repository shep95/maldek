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

declare global {
  interface Window {
    setIsCreatingPost: (value: boolean) => void;
  }
}

const DashboardLayout = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
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

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
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
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row">
        <Sidebar setIsCreatingPost={setIsCreatingPost} />
        <div className={cn(
          "flex-1 transition-all duration-200",
          "md:ml-64",
          location.pathname === '/dashboard' && "lg:mr-80"
        )}>
          <main className="min-h-screen pb-20 md:pb-0 px-4 md:px-8">
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
    </div>
  );
};

export default DashboardLayout;