import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

interface ProfileData {
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  follower_count: number;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        console.log("Fetching profile data...");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error("Auth error:", authError);
          throw new Error('Not authenticated');
        }

        console.log("User authenticated, fetching profile...");
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.message.includes('JSON object requested, multiple (or no) rows returned')) {
          console.log("No profile found, creating new profile...");
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                username: `user_${user.id.slice(0, 8)}`,
                bio: '',
                avatar_url: null,
                follower_count: 0
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error("Profile creation error:", createError);
            throw createError;
          }

          console.log("New profile created:", newProfile);
          setIsCurrentUser(true);
          setEditBio(newProfile.bio || "");
          return newProfile as ProfileData;
        }

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        console.log("Profile data fetched:", existingProfile);
        setIsCurrentUser(true);
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
          isCurrentUser={isCurrentUser}
          onEditClick={() => setIsEditing(!isEditing)}
          isEditing={isEditing}
        />
        <ProfileInfo
          username={profile.username}
          bio={profile.bio || ""}
          followerCount={profile.follower_count}
          createdAt={profile.created_at}
          isCurrentUser={isCurrentUser}
          isEditing={isEditing}
          editBio={editBio}
          onEditBioChange={setEditBio}
          onSaveChanges={handleUpdateProfile}
        />
        <ProfileTabs />
      </Card>
    </div>
  );
};

export default Profile;
