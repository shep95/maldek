
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SendMessageParams {
  recipientId: string;
  content: string;
}

export const useMessageActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // This is a simplified version that works with our mock implementation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: SendMessageParams) => {
      // In a real implementation, this would send the message
      console.log("Sending message to", recipientId, ":", content);
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      // Provide feedback on mobile that the message was sent
      if (window.innerWidth < 768) {
        // Vibrate device if supported (mobile only)
        if (navigator.vibrate) {
          navigator.vibrate(50); // Gentle vibration feedback
        }
      }
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending
  };
};
