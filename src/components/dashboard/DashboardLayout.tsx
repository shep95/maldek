import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { CreatePostDialog } from "./CreatePostDialog";
import { useSession } from '@supabase/auth-helpers-react';
import { Author } from "@/utils/postUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('No session user ID found');
        return null;
      }

      console.log('Fetching profile for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading profile');
        return null;
      }

      console.log('Profile fetched:', data);
      return data;
    },
    enabled: !!session?.user?.id
  });

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: profile?.username || '',
    avatar_url: profile?.avatar_url || '',
    name: profile?.username || ''
  };

  const handlePostCreated = (newPost: any) => {
    console.log('New post created:', newPost);
    setIsCreatingPost(false);
    toast.success('Post created successfully!');
  };

  // Don't show create post dialog if profile is still loading
  if (isLoadingProfile) {
    return <div>Loading...</div>;
  }

  // Don't show create post dialog if no profile data
  if (!profile) {
    console.error('No profile data available');
    return <div>Error loading profile</div>;
  }

  const showRightSidebar = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row">
        <Sidebar setIsCreatingPost={setIsCreatingPost} />
        <div className={cn(
          "flex-1 transition-all duration-200",
          "md:ml-64",
          showRightSidebar && "lg:mr-80"
        )}>
          <main className="min-h-screen pb-20 md:pb-0 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
        {showRightSidebar && <RightSidebar />}
      </div>
      {profile && (
        <CreatePostDialog
          isOpen={isCreatingPost}
          onOpenChange={setIsCreatingPost}
          currentUser={currentUser}
          onPostCreated={handlePostCreated}
        />
      )}
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;