
import { useState, useMemo } from "react";
import { useSession } from '@supabase/auth-helpers-react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreatePostDialog } from "@/components/dashboard/CreatePostDialog";
import { PostList } from "@/components/dashboard/PostList";
import { Author } from "@/utils/postUtils";
import { DashboardError } from "@/components/dashboard/error/DashboardError";
import { DashboardLoading } from "@/components/dashboard/loading/DashboardLoading";
import { Grid, Users, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ProfilePopupWrapper } from "@/components/profile/ProfilePopupWrapper";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [followingOnly, setFollowingOnly] = useState(false);
  const session = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('No user session found');
        return null;
      }
      
      try {
        console.log('Fetching profile for user:', session.user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading profile:', profileError);
          throw profileError;
        }

        if (!profileData) {
          console.error('Profile not found:', session.user.id);
          toast.error('Unable to load profile. Please try signing out and back in.');
          return null;
        }

        console.log('Profile loaded successfully:', profileData);
        return profileData;
      } catch (error) {
        console.error('Error in profile query:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
    enabled: !!session?.user?.id,
  });

  // Memoize currentUser to prevent unnecessary re-renders
  const currentUser: Author = useMemo(() => ({
    id: session?.user?.id || '',
    username: profile?.username || '',
    avatar_url: profile?.avatar_url || '',
    name: profile?.username || ''
  }), [session?.user?.id, profile?.username, profile?.avatar_url]);

  const handlePostCreated = (newPost: any) => {
    console.log('New post created on dashboard:', newPost);
    
    // Invalidate and refetch posts to show the new post immediately
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    
    // Close the dialog
    setIsCreatingPost(false);
    
    // Navigate to dashboard if not already there
    navigate('/dashboard');
    
    // Scroll to top to show new post
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast.success('Post created successfully!');
  };

  // Early returns for loading and error states
  if (error) {
    console.error('Profile loading error:', error);
    return <DashboardError />;
  }

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!profile) {
    return <DashboardError />;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-lg border border-white/10 p-4 shadow-lg">
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"
          >
            <Grid className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold">Home</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFollowingOnly(false)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors",
                !followingOnly ? "text-accent bg-accent/10" : "text-muted-foreground"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">All</span>
            </button>
            <button
              onClick={() => setFollowingOnly(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors",
                followingOnly ? "text-accent bg-accent/10" : "text-muted-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Following</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <main className={cn(
          "w-full max-w-3xl px-4 sm:px-6",
          "py-6 md:py-8 md:pl-28 lg:pl-32",
          "animate-fade-in",
          "mt-20 md:mt-0",
          "min-h-[100dvh]"
        )}>
          <PostList 
            followingOnly={followingOnly} 
            setFollowingOnly={setFollowingOnly}
          />
        </main>
      </div>

      <CreatePostDialog
        isOpen={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        currentUser={currentUser}
        onPostCreated={handlePostCreated}
      />

      <ProfilePopupWrapper />
    </div>
  );
};

export default Dashboard;
