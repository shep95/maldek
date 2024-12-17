import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface FollowButtonProps {
  userId: string;
}

export const FollowButton = ({ userId }: FollowButtonProps) => {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const { data: isFollowing, refetch } = useQuery({
    queryKey: ['is-following', userId],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      const { data, error } = await supabase
        .from('followers')
        .select()
        .eq('follower_id', session.user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!session?.user?.id && !!userId
  });

  const handleFollowClick = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to follow users");
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);

        if (error) throw error;
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: session.user.id,
            following_id: userId
          });

        if (error) throw error;
        toast.success("Followed successfully");
      }

      refetch();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error("Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleFollowClick}
      disabled={isLoading}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};