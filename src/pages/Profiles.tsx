import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { DashboardError } from "@/components/dashboard/error/DashboardError";
import { DashboardLoading } from "@/components/dashboard/loading/DashboardLoading";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileMusicTab } from "@/components/profile/ProfileMusicTab";
import { AdvertisementTab } from "@/components/profile/tabs/AdvertisementTab";
import { Card } from "@/components/ui/card";
import { CircuitBoard, Signal, Binary } from "lucide-react";

const Profiles = () => {
  const session = useSession();
  const { username } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  console.log('=== Profile Page Debug Logs ===');
  console.log('Current pathname:', location.pathname);
  console.log('Username param:', username);
  console.log('Session user:', session?.user?.id);

  useEffect(() => {
    console.log('Profile component mounted/updated');
    console.log('Current URL:', window.location.href);
    return () => {
      console.log('Profile component unmounting');
    };
  }, [username]);

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', username || session?.user?.id],
    queryFn: async () => {
      console.log('Starting profile fetch...');
      
      let query = supabase
        .from('profiles')
        .select('*');

      if (username) {
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
        console.log('Fetching profile by username:', cleanUsername);
        query = query.eq('username', cleanUsername);
      } else if (session?.user?.id) {
        console.log('Fetching profile by user ID:', session.user.id);
        query = query.eq('id', session.user.id);
      } else {
        console.error('No username or user ID available');
        throw new Error('No username or user ID available');
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading profile');
        throw error;
      }

      if (!data) {
        console.error('Profile not found');
        toast.error('Profile not found');
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    },
    retry: 1
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', profile?.id],
    queryFn: async () => {
      console.log('Fetching user posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
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
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
        throw error;
      }

      console.log('Posts fetched:', data);
      return data;
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase.channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['profile', username || session?.user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, username, session?.user?.id, queryClient]);

  const handlePostAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  if (profileError) {
    return <DashboardError />;
  }

  if (profileLoading) {
    return <DashboardLoading />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ProfileHeader profile={profile} isLoading={profileLoading} />
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start h-14 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-1 mb-8 overflow-hidden">
            <TabsTrigger 
              value="posts" 
              className="relative h-12 px-6 rounded-xl data-[state=active]:bg-gradient-to-r from-accent to-accent/80 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:text-accent gap-2"
            >
              <CircuitBoard className="w-4 h-4" />
              <span className="relative z-10">Posts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="music" 
              className="relative h-12 px-6 rounded-xl data-[state=active]:bg-gradient-to-r from-accent to-accent/80 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:text-accent gap-2"
            >
              <Signal className="w-4 h-4" />
              <span className="relative z-10">Music</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ads" 
              className="relative h-12 px-6 rounded-xl data-[state=active]:bg-gradient-to-r from-accent to-accent/80 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:text-accent gap-2"
            >
              <Binary className="w-4 h-4" />
              <span className="relative z-10">Advertisements</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0 animate-fade-in">
            <ProfilePosts 
              posts={posts || []} 
              isLoading={postsLoading} 
              onPostAction={handlePostAction} 
            />
          </TabsContent>

          <TabsContent value="music" className="mt-0 animate-fade-in">
            <ProfileMusicTab />
          </TabsContent>

          <TabsContent value="ads" className="mt-0 animate-fade-in">
            <AdvertisementTab userId={profile.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profiles;
