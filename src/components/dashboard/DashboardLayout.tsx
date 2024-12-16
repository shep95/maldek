import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { CreatePostDialog } from "./CreatePostDialog";
import { useSession } from '@supabase/auth-helpers-react';
import { Author } from "@/utils/postUtils";
import { RightSidebar } from "./RightSidebar";
import { cn } from "@/lib/utils";
import { DashboardLoading } from "./loading/DashboardLoading";
import { DashboardError } from "./error/DashboardError";
import { useProfileData } from "./hooks/useProfileData";

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

  const { profile, isLoading, error } = useProfileData();

  // Show loading state while checking/creating profile
  if (isLoading) {
    return <DashboardLoading />;
  }

  // Show error state if profile loading failed
  if (error) {
    return <DashboardError />;
  }

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: profile?.username || '',
    avatar_url: profile?.avatar_url || '',
    name: profile?.username || ''
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
      {profile && (
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
      )}
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;