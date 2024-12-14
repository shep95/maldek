import { useState } from "react";
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
  const { username } = useParams();
  
  // Remove @ from username if present
  const cleanUsername = username?.startsWith('@') ? username.substring(1) : username;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', cleanUsername],
    queryFn: async () => {
      if (!cleanUsername) {
        console.log("No username provided");
        return null;
      }

      console.log("Fetching profile for:", cleanUsername);

      // First, get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get profile by username using a direct query
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      if (!profiles) {
        console.log("No profile found for username:", cleanUsername);
        return null;
      }

      console.log("Found profile:", profiles);
      
      // Set whether this is the current user's profile
      setIsCurrentUser(session?.user?.id === profiles.id);
      setEditBio(profiles.bio || "");

      return profiles;
    },
    retry: false
  });

  const handleUpdateProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
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
        .eq('id', session.user.id);

      if (error) throw error;
      
      setIsEditing(false);
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
      <div className="animate-fade-in py-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">
          The profile you're looking for doesn't exist or has been removed.
        </p>
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
      onImageUpdate={() => {}}
    />
  );
};

export default Profile;