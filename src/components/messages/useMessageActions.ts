
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SendMessageParams {
  recipientId: string;
  content: string;
}

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

  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: SendMessageParams) => {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert message with correct status value
      const { error } = await supabase
        .from('messages')
        .insert({
          recipient_id: recipientId,
          sender_id: user.id,
          content,
          status: 'pending',
          read_at: null,
          removed_by_recipient: false,
          deleted_at: null,
          deleted_by_recipient: false,
          deleted_by_sender: false,
          is_edited: false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

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
    sendMessage: sendMessageMutation.mutate,
    acceptRequest: acceptMutation.mutate,
    declineRequest: declineMutation.mutate,
  };
};
