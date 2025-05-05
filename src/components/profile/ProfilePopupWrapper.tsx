
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfileNavigation } from "@/hooks/useProfileNavigation";
import { ProfilePopup } from "./ProfilePopup";
import { useSession } from '@supabase/auth-helpers-react';

export const ProfilePopupWrapper = () => {
  const { profilePopupOpen, selectedProfile, closeProfilePopup, viewFullProfile } = useProfileNavigation();
  const session = useSession();
  
  // Query to fetch the profile data when a username is selected
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-popup', selectedProfile],
    queryFn: async () => {
      if (!selectedProfile) return null;
      
      const cleanUsername = selectedProfile.startsWith('@') 
        ? selectedProfile.slice(1) 
        : selectedProfile;
        
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!selectedProfile && profilePopupOpen,
  });

  // Query to fetch user posts when a profile is loaded
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['profile-popup-posts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url,
            user_subscriptions (
              status,
              subscription_tiers (
                name,
                checkmark_color
              )
            )
          ),
          post_likes (id, user_id),
          bookmarks (id, user_id),
          comments (id)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const isLoading = profileLoading || postsLoading;
  const isOwnProfile = session?.user?.id === profile?.id;

  return (
    <ProfilePopup
      isOpen={profilePopupOpen}
      onClose={closeProfilePopup}
      profile={profile}
      isOwnProfile={isOwnProfile}
      posts={posts || []}
      isLoading={isLoading}
      onViewFullProfile={viewFullProfile}
    />
  );
};
