
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

/**
 * Load, block, and unblock users
 */
export function useBlockedUsers() {
  const session = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // Get list of blocked user IDs
  const { data: blocked, isLoading } = useQuery({
    queryKey: ["blocked-users", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_blocks")
        .select("blocked_user_id")
        .eq("user_id", userId);

      if (error) throw error;
      return data?.map((row) => row.blocked_user_id) || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  // Block
  const blockMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!userId || !blockedUserId) return;
      const { error } = await supabase.from("user_blocks").insert({
        user_id: userId,
        blocked_user_id: blockedUserId,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users", userId] });
      toast.success("User blocked");
    },
    onError: () => {
      toast.error("Failed to block user");
    },
  });

  // Unblock
  const unblockMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!userId || !blockedUserId) return;
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("user_id", userId)
        .eq("blocked_user_id", blockedUserId);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users", userId] });
      toast.success("User unblocked");
    },
    onError: () => {
      toast.error("Failed to unblock user");
    },
  });

  return {
    blockedUserIds: blocked || [],
    isLoadingBlocked: isLoading,
    blockUser: blockMutation.mutate,
    unblockUser: unblockMutation.mutate,
    isBlocking: blockMutation.isPending,
    isUnblocking: unblockMutation.isPending,
  };
}
