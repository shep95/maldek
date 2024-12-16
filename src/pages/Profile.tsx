import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSession } from "@supabase/auth-helpers-react";
import { ProfileContainer } from "@/components/profile/ProfileContainer";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const session = useSession();
  const { username } = useParams();
  
  // Remove @ from username if present, or use current user's profile if no username provided
  const cleanUsername = username?.replace('@', '') || '';

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', cleanUsername || session?.user?.id],
    queryFn: async () => {
      console.log("Fetching profile for:", cleanUsername || session?.user?.id);

      const query = supabase
        .from('profiles')
        .select('*')
        .single();

      // If username is provided, query by username, otherwise query by current user's ID
      if (cleanUsername) {
        query.eq('username', cleanUsername);
      } else if (session?.user?.id) {
        query.eq('id', session.user.id);
      } else {
        throw new Error('No username or session ID provided');
      }

      const { data: profileData, error: profileError } = await query;

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return null;
      }

      if (!profileData) {
        console.log("No profile found");
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
      onImageUpdate={(type, url) => {}}
    />
  );
};

export default Profile;