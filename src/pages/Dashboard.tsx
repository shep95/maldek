
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
import { Grid, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
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
          console.log('No profile found, waiting for trigger to create one...');
          // Wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (retryError) throw retryError;
          if (!retryData) {
            toast.error('Unable to load profile. Please refresh the page.');
            throw new Error('Profile not found after retry');
          }
          
          return retryData;
        }

        console.log('Profile loaded successfully:', profileData);
        return profileData;
      } catch (error) {
        console.error('Error in profile query:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
  });

  if (error) {
    console.error('Profile loading error:', error);
    return <DashboardError />;
  }

  if (isLoading) {
    return <DashboardLoading />;
  }

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: profile?.username || '',
    avatar_url: profile?.avatar_url || '',
    name: profile?.username || ''
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
      {/* Floating Top Navigation */}
      <div className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-lg border border-white/10 p-4 shadow-lg">
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"
          >
            <Grid className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold">Home</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Latest posts</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <main className={cn(
          "w-full max-w-3xl px-4 sm:px-6",
          "py-6 md:py-8 md:pl-28 lg:pl-32",
          "animate-fade-in",
          "mt-20 md:mt-0", // Add top margin to account for floating nav on mobile
          "min-h-[100dvh]"
        )}>
          <PostList />
        </main>
      </div>

      <CreatePostDialog
        isOpen={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        currentUser={currentUser}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Dashboard;
