import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const session = useSession();
  const { username } = useParams();
  const navigate = useNavigate();
  
  // Remove @ from username if present
  const cleanUsername = username?.startsWith('@') ? username.substring(1) : username;

  console.log('Profile component rendered with:', {
    username: cleanUsername,
    sessionUserId: session?.user?.id
  });

  // First, get the user ID for the profile we want to view
  const { data: targetUser, isLoading: isLoadingUserId } = useQuery({
    queryKey: ['user-id', cleanUsername],
    queryFn: async () => {
      // If no username provided and user is logged in, use current user's profile
      if (!cleanUsername && session?.user?.id) {
        console.log('No username provided, using current user:', session.user.id);
        return { id: session.user.id };
      }

      // If username is provided, fetch the corresponding user ID
      if (cleanUsername) {
        console.log("Fetching user ID for username:", cleanUsername);
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .single();

        if (error) {
          console.error("Error fetching user ID:", error);
          toast.error("Profile not found");
          navigate('/dashboard');
          return null;
        }

        return data;
      }

      // If no username and no session, redirect to dashboard
      console.log('No username or session ID provided');
      navigate('/dashboard');
      return null;
    },
    retry: 1
  });

  // Then fetch the full profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile-data', targetUser?.id],
    queryFn: async () => {
      if (!targetUser?.id) {
        console.log('No target user ID found');
        return null;
      }

      console.log("Fetching profile for user:", targetUser.id);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          followers!followers_following_id_fkey (
            follower_id
          ),
          following:followers!followers_follower_id_fkey (
            following_id
          ),
          posts (
            id
          )
        `)
        .eq('id', targetUser.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        toast.error("Error loading profile");
        return null;
      }

      console.log("Found profile:", data);
      setEditBio(data.bio || "");
      
      return {
        ...data,
        followerCount: data.followers?.length || 0,
        followingCount: data.following?.length || 0,
        postCount: data.posts?.length || 0,
        isCurrentUser: session?.user?.id === data.id
      };
    },
    enabled: !!targetUser?.id,
    retry: 1
  });

  const handleUpdateProfile = async () => {
    try {
      if (!session?.user?.id || !profile?.isCurrentUser) {
        toast("You must be logged in to update your profile");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ bio: editBio })
        .eq('id', session.user.id);

      if (error) throw error;
      
      setIsEditing(false);
      toast("Profile updated successfully");
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast(error.message || "Failed to update profile");
    }
  };

  if (isLoadingUserId || isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <div className="px-6">
            <Skeleton className="h-32 w-32 rounded-full -mt-16 border-4 border-background" />
            <div className="mt-4 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
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
