import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useParams } from "react-router-dom";

interface ProfileData {
  username: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
  follower_count: number;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { userId } = useParams();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      try {
        console.log("Fetching profile data for user:", userId);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          throw new Error('Not authenticated');
        }

        const targetUserId = userId || user.id;
        console.log("Target user ID:", targetUserId);

        // First check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (profileError) {
          // If profile doesn't exist, create it
          if (profileError.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                { 
                  id: targetUserId,
                  username: user.user_metadata.username || user.email,
                  bio: '',
                  follower_count: 0,
                  banner_url: null,
                  avatar_url: null
                }
              ])
              .select()
              .single();

            if (createError) {
              console.error("Profile creation error:", createError);
              throw createError;
            }

            console.log("Created new profile:", newProfile);
            return newProfile as ProfileData;
          }
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        console.log("Profile data fetched:", existingProfile);
        setIsCurrentUser(user.id === targetUserId);
        setEditBio(existingProfile.bio || "");
        return existingProfile as ProfileData;
      } catch (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Subscribe to real-time profile updates
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up real-time subscription for profile:", userId);
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log("Received profile update:", payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up profile subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ bio: editBio })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      setIsEditing(false);
      refetch();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleImageUpdate = (type: 'avatar' | 'banner', url: string) => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in py-4">
        <div className="animate-pulse text-accent">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="animate-fade-in py-4">
        <div className="text-destructive">Error loading profile. Please refresh the page.</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <Card className="border-none bg-transparent shadow-none overflow-hidden">
        <ProfileHeader
          username={profile.username}
          avatarUrl={profile.avatar_url}
          bannerUrl={profile.banner_url}
          isCurrentUser={isCurrentUser}
          onEditClick={() => setIsEditing(!isEditing)}
          isEditing={isEditing}
          userId={userId || ''}
          onImageUpdate={handleImageUpdate}
        />
        <ProfileInfo
          username={profile.username}
          bio={profile.bio || ""}
          followerCount={profile.follower_count}
          createdAt={profile.created_at}
          userId={userId || ''}
          isCurrentUser={isCurrentUser}
          isEditing={isEditing}
          editBio={editBio}
          onEditBioChange={setEditBio}
          onSaveChanges={handleUpdateProfile}
        />
        <div className="mt-4">
          <ProfileTabs />
        </div>
      </Card>
    </div>
  );
};

export default Profile;