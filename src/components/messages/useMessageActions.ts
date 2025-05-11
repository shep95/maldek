
import { useToast } from "@/components/ui/use-toast";
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

  return {
    sendMessage: sendMessageMutation.mutate
  };
};
