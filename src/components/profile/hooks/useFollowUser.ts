import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFollowUser = (userId: string, currentUserId: string | undefined) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);

  // Check if current user is following this profile
  useEffect(() => {
    const checkFollowStatus = async () => {
      // Don't proceed if either ID is missing or if user is trying to follow themselves
      if (!currentUserId || !userId || userId === currentUserId) return;

      console.log('Checking follow status:', { currentUserId, userId });
      try {
        const { data, error } = await supabase
          .from('followers')
          .select('*')
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) {
          console.error('Error checking follow status:', error);
          return;
        }

        // If data exists and has length > 0, user is following
        setIsFollowing(data && data.length > 0);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [currentUserId, userId]);

  // Get following count
  useEffect(() => {
    const getFollowingCount = async () => {
      // Don't proceed if userId is missing
      if (!userId) return;

      try {
        const { count, error } = await supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);

        if (error) {
          console.error('Error getting following count:', error);
          return;
        }

        setFollowingCount(count || 0);
      } catch (error) {
        console.error('Error getting following count:', error);
      }
    };

    getFollowingCount();
  }, [userId]);

  const handleFollow = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (!userId) {
      toast.error('Invalid user profile');
      return;
    }

    if (userId === currentUserId) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      console.log('Following/unfollowing user:', userId);
      
      if (isFollowing) {
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) throw error;
        
        toast.success('Unfollowed successfully');
      } else {
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: currentUserId,
            following_id: userId
          });

        if (error) {
          if (error.code === '23505') {
            toast.error('You are already following this user');
            return;
          }
          throw error;
        }

        toast.success('Followed successfully');
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    }
  };

  return {
    isFollowing,
    followingCount,
    handleFollow
  };
};