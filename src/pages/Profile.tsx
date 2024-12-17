import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useParams, Navigate } from "react-router-dom";
import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { useSession } from '@supabase/auth-helpers-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const session = useSession();
  const { username } = useParams();
  
  // Remove @ from username if present and handle undefined
  const cleanUsername = username?.replace('@', '') || '';

  // Redirect to dashboard if no username
  if (!cleanUsername) {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', cleanUsername],
    queryFn: async () => {
      console.log("Fetching profile for username:", cleanUsername);

      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return null;
      }

      if (!profileData) {
        console.log("No profile found for username:", cleanUsername);
        return null;
      }

      console.log("Found profile:", profileData);
      
      // Set whether this is the current user's profile
      const isCurrentUser = session?.user?.id === profileData.id;
      setEditBio(profileData.bio || "");

      return { ...profileData, isCurrentUser };
    },
    retry: 1
  });

  const handleUpdateProfile = async () => {
    try {
      if (!session?.user?.id || !profile?.isCurrentUser) {
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

  if (!profile) {
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
      isCurrentUser={profile.isCurrentUser}
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