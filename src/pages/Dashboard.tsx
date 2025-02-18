import { useState } from "react";
import { useSession } from '@supabase/auth-helpers-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreatePostDialog } from "@/components/dashboard/CreatePostDialog";
import { PostList } from "@/components/dashboard/PostList";
import { Author } from "@/utils/postUtils";
import { DashboardError } from "@/components/dashboard/error/DashboardError";
import { DashboardLoading } from "@/components/dashboard/loading/DashboardLoading";
import { Grid, Users, CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ProfilePopup } from "@/components/profile/ProfilePopup";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [followingOnly, setFollowingOnly] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const session = useSession();
  const navigate = useNavigate();

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
  });

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          ),
          bookmarks (
            id,
            user_id
          ),
          comments (
            id
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user posts:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!session?.user?.id,
  });

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

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: profile.username,
    avatar_url: profile.avatar_url || '',
    name: profile.username
  };

  const handlePostCreated = (newPost: any) => {
    console.log('New post created:', newPost);
    setIsCreatingPost(false);
    navigate('/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Post created successfully!');
  };

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsProfileOpen(true)}
              className="ml-2"
            >
              <User className="h-5 w-5" />
            </Button>
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

      <ProfilePopup
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        isOwnProfile={true}
        posts={posts || []}
        isLoading={isPostsLoading}
      />
    </div>
  );
};

export default Dashboard;
