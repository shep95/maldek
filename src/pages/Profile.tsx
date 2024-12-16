import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const session = useSession();
  const { username } = useParams();
  const navigate = useNavigate();
  
  // Remove @ from username if present
  const cleanUsername = username?.replace('@', '');

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
    retry: 1,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
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

      if (!data) {
        console.log("No profile found");
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
    retry: 1,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
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
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" /> {/* Banner */}
          <div className="px-6">
            <Skeleton className="h-32 w-32 rounded-full -mt-16 border-4 border-background" /> {/* Avatar */}
            <div className="mt-4 space-y-4">
              <Skeleton className="h-8 w-48" /> {/* Username */}
              <Skeleton className="h-4 w-64" /> {/* Bio */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" /> {/* Followers */}
                <Skeleton className="h-4 w-24" /> {/* Following */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !targetUser || !profile) {
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