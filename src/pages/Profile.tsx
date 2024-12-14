import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ProfileContainer } from "@/components/profile/ProfileContainer";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { username } = useParams();
  const navigate = useNavigate();
  
  // Remove @ from username if present
  const cleanUsername = username?.startsWith('@') ? username.substring(1) : username;

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', cleanUsername],
    queryFn: async () => {
      console.log("Fetching profile data for username:", cleanUsername);
      
      if (!cleanUsername) {
        console.error("No username provided");
        throw new Error('Username is required');
      }

      // First get the profile by username
      const { data: profileByUsername, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      if (!profileByUsername) {
        console.error("Profile not found for username:", cleanUsername);
        throw new Error('Profile not found');
      }

      console.log("Found profile:", profileByUsername);

      // Check if this is the current user
      const { data: { user } } = await supabase.auth.getUser();
      const isCurrentUserProfile = user?.id === profileByUsername.id;
      console.log("Is current user's profile:", isCurrentUserProfile);
      
      setIsCurrentUser(isCurrentUserProfile);
      setEditBio(profileByUsername.bio || "");
      
      return profileByUsername;
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
        <div className="text-destructive">Error loading profile. Please try again.</div>
      </div>
    );
  }

  return (
    <ProfileContainer
      profile={profile}
      isCurrentUser={isCurrentUser}
      isEditing={isEditing}
      editBio={editBio}
      userId={profile.id}
      onEditClick={() => setIsEditing(!isEditing)}
      onEditBioChange={setEditBio}
      onSaveChanges={handleUpdateProfile}
      onImageUpdate={() => refetch()}
    />
  );
};

export default Profile;