import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { ProfileContainer } from "@/components/profile/ProfileContainer";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const session = useSession();
  const { username } = useParams();
  const navigate = useNavigate();
  
  // Remove @ from username if present
  const cleanUsername = username?.replace('@', '');

  // First, get the user ID for the profile we want to view
  const { data: targetUser, isLoading: isLoadingUserId } = useQuery({
    queryKey: ['user-id', cleanUsername],
    queryFn: async () => {
      if (!cleanUsername && !session?.user?.id) {
        console.log('No username or session ID provided');
        return null;
      }

      // If no username provided, use current user's profile
      if (!cleanUsername) {
        return { id: session?.user?.id };
      }

      console.log("Fetching user ID for username:", cleanUsername);
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .single();

      if (error) {
        console.error("Error fetching user ID:", error);
        return null;
      }

      return data;
    },
    retry: 1
  });

  // Then fetch the full profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', targetUser?.id],
    queryFn: async () => {
      if (!targetUser?.id) {
        console.log('No target user ID found');
        return null;
      }

      console.log("Fetching profile for user:", targetUser.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUser.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }

      if (!data) {
        console.log("No profile found");
        return null;
      }

      console.log("Found profile:", data);
      setEditBio(data.bio || "");
      
      return {
        ...data,
        isCurrentUser: session?.user?.id === data.id
      };
    },
    enabled: !!targetUser?.id,
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
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (isLoadingUserId || isLoading) {
    return (
      <div className="animate-fade-in py-4">
        <div className="animate-pulse text-accent">Loading profile...</div>
      </div>
    );
  }

  if (error || !targetUser) {
    console.error("Profile error:", error);
    return (
      <div className="animate-fade-in py-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">
          The profile you're looking for doesn't exist or has been removed.
        </p>
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
      onImageUpdate={(type, url) => {
        console.log("Image update:", type, url);
      }}
    />
  );
};

export default Profile;