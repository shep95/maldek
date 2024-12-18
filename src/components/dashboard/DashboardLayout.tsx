import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { CreatePostDialog } from "./CreatePostDialog";
import { useSession } from '@supabase/auth-helpers-react';
import { Author } from "@/utils/postUtils";
import { RightSidebar } from "./RightSidebar";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    setIsCreatingPost: (value: boolean) => void;
  }
}

const DashboardLayout = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const session = useSession();
  const location = useLocation();

  // Make setIsCreatingPost available globally for the mobile nav
  window.setIsCreatingPost = setIsCreatingPost;

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: session?.user?.email?.split('@')[0] || '',
    avatar_url: '',
    name: session?.user?.email?.split('@')[0] || ''
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