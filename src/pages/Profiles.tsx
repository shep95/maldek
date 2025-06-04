
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { DashboardError } from "@/components/dashboard/error/DashboardError";
import { DashboardLoading } from "@/components/dashboard/loading/DashboardLoading";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileMusicTab } from "@/components/profile/ProfileMusicTab";
import { ProfilePrivacyTab } from "@/components/profile/ProfilePrivacyTab";
import { CircuitBoard, Signal, Lock } from "lucide-react";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { ProfileBackButton } from "@/components/profile/ProfileBackButton";

const Profiles = () => {
  const session = useSession();
  const { username } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { blockedUserIds, isLoadingBlocked } = useBlockedUsers();

  // Extract tab from URL parameters - memoized
  const defaultTab = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'posts';
  }, [location.search]);

  // Memoized profile identifier
  const profileIdentifier = useMemo(() => {
    return username || session?.user?.id;
  }, [username, session?.user?.id]);

  console.log('=== Profile Page Debug Logs ===');
  console.log('Current pathname:', location.pathname);
  console.log('Username param:', username);
  console.log('Session user:', session?.user?.id);
  console.log('Default tab:', defaultTab);

  // Optimized profile query with reduced payload
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', profileIdentifier],
    queryFn: async () => {
      console.log('Starting profile fetch...');
      
      let query = supabase
        .from('profiles')
        .select('id, username, avatar_url, banner_url, bio, follower_count, total_posts, total_likes_received, created_at, location, website');

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
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
    enabled: !!profileIdentifier
  });

  // Optimized posts query with pagination and reduced payload
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', profile?.id],
    queryFn: async () => {
      console.log('Fetching user posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes,
          reposts,
          view_count,
          media_urls,
          user_id,
          profiles!inner (
            id,
            username,
            avatar_url
          ),
          post_likes!left (
            id,
            user_id
          ),
          bookmarks!left (
            id,
            user_id
          ),
          comments!left (
            id
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20); // Limit initial load

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
        throw error;
      }

      console.log('Posts fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!profile?.id,
    staleTime: 60000, // Cache for 1 minute
  });

  // Memoized realtime subscription setup
  const setupRealtimeSubscription = useCallback(() => {
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
          queryClient.invalidateQueries({ queryKey: ['profile', profileIdentifier] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profileIdentifier, queryClient]);

  // Single effect for realtime subscription
  useEffect(() => {
    return setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);

  // Memoized post action handler
  const handlePostAction = useCallback(async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        toast.success('Post deleted successfully');
        
        // Optimistically update cache
        queryClient.setQueryData(['user-posts', profile?.id], (oldData: any[]) => {
          return oldData?.filter(post => post.id !== postId) || [];
        });
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} post`);
    }
  }, [profile?.id, queryClient]);

  // Memoized profile update handler
  const handleProfileUpdate = useCallback(() => {
    refetchProfile();
  }, [refetchProfile]);

  // Memoized visible posts filtering
  const visiblePosts = useMemo(() => {
    if (!posts || !blockedUserIds) return [];
    return posts.filter(post => !blockedUserIds.includes(post.user_id));
  }, [posts, blockedUserIds]);

  // Memoized ownership check
  const isOwnProfile = useMemo(() => {
    return session?.user?.id === profile?.id;
  }, [session?.user?.id, profile?.id]);

  if (profileError) return <DashboardError />;
  if (profileLoading || isLoadingBlocked) return <DashboardLoading />;
  
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
    <div className="min-h-screen relative">
      <ProfileBackButton />
      <ProfileHeader 
        profile={profile} 
        isLoading={profileLoading} 
      />
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <Tabs defaultValue={defaultTab} className="w-full">
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
            {isOwnProfile && (
              <TabsTrigger 
                value="privacy" 
                className="relative h-12 px-6 rounded-xl data-[state=active]:bg-gradient-to-r from-accent to-accent/80 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:text-accent gap-2"
              >
                <Lock className="w-4 h-4" />
                <span className="relative z-10">Privacy</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="posts" className="mt-0 animate-fade-in">
            <ProfilePosts 
              posts={visiblePosts}
              isLoading={postsLoading}
              onPostAction={handlePostAction}
            />
          </TabsContent>

          <TabsContent value="music" className="mt-0 animate-fade-in">
            <ProfileMusicTab />
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="privacy" className="mt-0 animate-fade-in">
              <ProfilePrivacyTab userId={profile.id} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profiles;
