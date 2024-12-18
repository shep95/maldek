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

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const session = useSession();

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
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
          throw profileError;
        }

        if (!profileData) {
          console.log('No profile found, creating default profile...');
          const username = session.user.email?.split('@')[0] || 'user';
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              username: username,
              avatar_url: null
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }

          return newProfile;
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
    toast.success('Post created successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center">
        <main className="w-full max-w-3xl px-4 py-6 md:py-8 md:pl-24 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Grid className="h-6 w-6 text-accent" />
              <h1 className="text-3xl font-bold text-foreground">Home</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Latest posts</span>
            </div>
          </div>
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