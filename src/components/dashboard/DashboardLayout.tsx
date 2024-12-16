import { useState, useEffect } from "react";
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

  // First, ensure profile exists
  const { data: profileExists } = useQuery({
    queryKey: ['profile-exists', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('No session user ID found');
        return null;
      }

      console.log('Checking if profile exists for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Profile not found, creating new profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
              created_at: new Date().toISOString(),
              follower_count: 0
            }])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Error creating profile');
            return null;
          }

          console.log('New profile created:', newProfile);
          return newProfile;
        }
        console.error('Error checking profile:', error);
        return null;
      }

      return data;
    },
    retry: 1
  });

  // Then fetch full profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id, profileExists?.id],
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
    enabled: !!session?.user?.id && !!profileExists,
    retry: 1
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

  const handleOpenChange = (open: boolean) => {
    console.log('Dialog open state changing to:', open);
    setIsCreatingPost(open);
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
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
          onOpenChange={handleOpenChange}
          currentUser={currentUser}
          onPostCreated={handlePostCreated}
        />
      )}
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;