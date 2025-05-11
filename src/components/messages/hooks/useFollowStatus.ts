
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

export const useFollowStatus = () => {
  const session = useSession();
  const currentUserId = session?.user?.id;

  const checkFollowStatus = async (targetUserId: string): Promise<boolean> => {
    if (!currentUserId || !targetUserId) return false;

    const { data, error } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', targetUserId)
      .eq('following_id', currentUserId)
      .single();

    if (error) {
      console.error('Error checking follow status:', error);
      return false;
    }

    return !!data;
  };

  return { checkFollowStatus };
};
