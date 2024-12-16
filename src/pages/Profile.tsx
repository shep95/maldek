import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { ProfileContainer } from "@/components/profile/ProfileContainer";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const session = useSession();
  const { username } = useParams();
  
  // Remove @ from username if present
  const cleanUsername = username?.replace('@', '');

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', cleanUsername || session?.user?.id],
    queryFn: async () => {
      if (!cleanUsername && !session?.user?.id) {
        console.log('No username or session ID provided');
        return null;
      }

      console.log("Fetching profile for:", cleanUsername || session?.user?.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq(cleanUsername ? 'username' : 'id', cleanUsername || session?.user?.id)
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
      
      // Set initial bio state
      const isCurrentUser = session?.user?.id === data.id;
      setEditBio(data.bio || "");

      return { ...data, isCurrentUser };
    },
    retry: 1,
    enabled: !!(cleanUsername || session?.user?.id)
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

  if (isLoading) {
    return (
      <div className="animate-fade-in py-4">
        <div className="animate-pulse text-accent">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    console.error("Profile error:", error);
    return (
      <div className="animate-fade-in py-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
        <p className="text-muted-foreground">
          There was an error loading this profile. Please try again later.
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
        // This will be implemented when needed
        console.log("Image update:", type, url);
      }}
    />
  );
};

export default Profile;
