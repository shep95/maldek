import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMessageActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMessageStatus = async (messageId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', messageId);

    if (error) throw error;
  };

  const acceptMutation = useMutation({
    mutationFn: (messageId: string) => handleMessageStatus(messageId, 'accepted'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message request accepted",
      });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message_requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept message request",
        variant: "destructive",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (messageId: string) => handleMessageStatus(messageId, 'rejected'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message request declined",
      });
      queryClient.invalidateQueries({ queryKey: ['message_requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to decline message request",
        variant: "destructive",
      });
    },
  });

  return {
    acceptRequest: acceptMutation.mutate,
    declineRequest: declineMutation.mutate,
  };
};