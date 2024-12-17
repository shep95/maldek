import { useQuery } from "@tanstack/react-query";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { DashboardError } from "@/components/dashboard/error/DashboardError";
import { DashboardLoading } from "@/components/dashboard/loading/DashboardLoading";
import { useParams } from "react-router-dom";

const Profiles = () => {
  const session = useSession();
  const { username } = useParams();

  // Fetch profile by username if provided, otherwise fetch current user's profile
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', username || session?.user?.id],
    queryFn: async () => {
      console.log('Fetching profile...', { username, userId: session?.user?.id });
      
      let query = supabase
        .from('profiles')
        .select();

      // If username is provided, fetch by username, otherwise fetch by user ID
      if (username) {
        query = query.eq('username', username);
      } else if (session?.user?.id) {
        query = query.eq('id', session.user.id);
      } else {
        console.error('No username or user ID available');
        throw new Error('No username or user ID available');
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
        throw error;
      }

      if (!data) {
        console.error('No profile found');
        throw new Error('Profile not found');
      }

      console.log('Profile fetched:', data);
      return data;
    },
    retry: 3,
    retryDelay: 1000,
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

  return (
    <div className="min-h-screen">
      <ProfileHeader profile={profile} isLoading={profileLoading} />
      <div className="max-w-4xl mx-auto px-4">
        <ProfilePosts 
          posts={posts || []} 
          isLoading={postsLoading} 
          onPostAction={handlePostAction} 
        />
      </div>
    </div>
  );
};

export default Profiles;