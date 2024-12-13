import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ProfileContainer } from "@/components/profile/ProfileContainer";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { userId } = useParams();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      console.log("Fetching profile data for user:", userId);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error('Not authenticated');
      }

      const targetUserId = userId || user.id;
      console.log("Target user ID:", targetUserId);

      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ 
              id: targetUserId,
              username: user.user_metadata.username || user.email,
              bio: '',
              follower_count: 0,
              banner_url: null,
              avatar_url: null
            }])
            .select()
            .single();

          if (createError) throw createError;
          return newProfile;
        }
        throw profileError;
      }

      setIsCurrentUser(user.id === targetUserId);
      setEditBio(existingProfile.bio || "");
      return existingProfile;
    },
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

      if (error) throw error;
      
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
    <ProfileContainer
      profile={profile}
      isCurrentUser={isCurrentUser}
      isEditing={isEditing}
      editBio={editBio}
      userId={userId || ''}
      onEditClick={() => setIsEditing(!isEditing)}
      onEditBioChange={setEditBio}
      onSaveChanges={handleUpdateProfile}
      onImageUpdate={() => refetch()}
    />
  );
};

export default Profile;