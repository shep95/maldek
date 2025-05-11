import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";

interface SendMessageParams {
  recipientId: string;
  content: string;
  conversationId?: string;
  isEncrypted?: boolean;
  isFollowing?: boolean;
  mediaFile?: File;
}

interface CreateConversationParams {
  recipientId: string;
  isRequest: boolean;
}

export const useMessageActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();
  const currentUserId = session?.user?.id;

  // Helper function to get or create a conversation
  const getOrCreateConversation = async (recipientId: string, isRequest: boolean): Promise<string> => {
    if (!currentUserId) throw new Error('Not authenticated');

    // Check if conversation exists
    const { data: existingConv, error: convCheckError } = await supabase
      .from("conversations")
      .select('id')
      .contains('participant_ids', [currentUserId, recipientId])
      .eq('is_request', isRequest)
      .single();

    if (convCheckError && convCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw convCheckError;
    }

    // If conversation exists, return it
    if (existingConv) {
      return existingConv.id;
    }

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({
        participant_ids: [currentUserId, recipientId],
        is_request: isRequest,
        created_by: currentUserId
      })
      .select()
      .single();

    if (createError) throw createError;
    if (!newConv) throw new Error('Failed to create conversation');

    // Add participants to conversation_participants table
    await Promise.all([
      supabase
        .from("conversation_participants")
        .insert({ conversation_id: newConv.id, user_id: currentUserId }),
      supabase
        .from("conversation_participants")
        .insert({ conversation_id: newConv.id, user_id: recipientId })
    ]);

    return newConv.id;
  };

  // Start a new conversation with a user
  const startConversation = useMutation({
    mutationFn: async ({ 
      recipientId, 
      isRequest 
    }: CreateConversationParams) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        // Get or create conversation based on follow status
        const conversationId = await getOrCreateConversation(
          recipientId, 
          isRequest
        );
        
        return { 
          success: true, 
          conversationId
        };
      } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message_requests'] });
      return data.conversationId;
    },
    onError: (error) => {
      toast.error("Failed to start conversation");
      console.error('Start conversation error:', error);
    }
  });

  // Upload media and get URL
  const uploadMedia = async (file: File): Promise<string | null> => {
    if (!currentUserId) return null;
    
    try {
      toast.info("Uploading media...");
      const mediaUrl = await handleImageUpload(file, currentUserId);
      if (!mediaUrl) {
        throw new Error("Failed to upload media");
      }
      return mediaUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Failed to upload media");
      return null;
    }
  };

  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      recipientId, 
      content, 
      conversationId,
      isEncrypted = false,
      isFollowing = false,
      mediaFile
    }: SendMessageParams) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        // Get or create conversation if no conversationId is provided
        const finalConversationId = conversationId || 
          await getOrCreateConversation(
            recipientId, 
            !isFollowing // is_request is true if they don't follow each other
          );
        
        // Upload media if provided
        let mediaUrl: string | null = null;
        if (mediaFile) {
          mediaUrl = await uploadMedia(mediaFile);
          if (!mediaUrl) {
            throw new Error("Media upload failed");
          }
        }
        
        // Prepare message data
        const messageData: any = {
          conversation_id: finalConversationId,
          sender_id: currentUserId,
          recipient_id: recipientId,
          content,
          is_encrypted: isEncrypted,
          is_read: false
        };
        
        // Only add media_url if we have one
        if (mediaUrl) {
          messageData.media_url = mediaUrl;
        }
        
        // Send message
        const { data: newMessage, error } = await supabase
          .from("messages")
          .insert(messageData)
          .select()
          .single();
          
        if (error) throw error;
        
        // Update conversation's updated_at timestamp
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq('id', finalConversationId);
        
        return { 
          success: true, 
          message: newMessage,
          conversationId: finalConversationId
        };
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message_requests'] });
      
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

  // Delete a single message
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        console.log("Deleting message:", messageId);
        
        // Get the message to check if current user is the sender
        const { data: message, error: fetchError } = await supabase
          .from('messages')
          .select('sender_id, conversation_id')
          .eq('id', messageId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Verify user owns the message
        if (message.sender_id !== currentUserId) {
          throw new Error("You can only delete your own messages");
        }
        
        // Delete the message
        const { error: deleteError } = await supabase
          .from('messages')
          .delete()
          .eq('id', messageId);
          
        if (deleteError) throw deleteError;
        
        return { 
          success: true,
          conversationId: message.conversation_id
        };
      } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      // Also update the conversation list to reflect changes in last_message
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message_requests'] });
    },
    onError: (error) => {
      toast.error("Failed to delete message");
      console.error('Delete message error:', error);
    }
  });

  // Accept a message request and move it to regular conversations
  const acceptMessageRequest = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        // Update conversation to mark it as not a request anymore
        const { data, error } = await supabase
          .from("conversations")
          .update({ 
            is_request: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId)
          .select('participant_ids')
          .single();
          
        if (error) throw error;
        
        return { 
          success: true, 
          conversationId,
          participantIds: data.participant_ids
        };
      } catch (error) {
        console.error('Error accepting message request:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Message request accepted");
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message_requests'] });
      return data.conversationId;
    },
    onError: (error) => {
      toast.error("Failed to accept message request");
      console.error('Accept message request error:', error);
    }
  });

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        console.log("Deleting conversation:", conversationId);
        
        // First delete all messages in the conversation
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId);
        
        if (messagesError) {
          console.error("Error with standard delete messages approach:", messagesError);
          
          // Try edge function as a fallback
          const { error: fnError } = await supabase.functions.invoke(
            'delete-conversation-messages',
            {
              body: { conversation_id: conversationId }
            }
          );
          
          if (fnError) {
            console.error("Edge function delete messages error:", fnError);
            throw new Error(`Failed to delete messages: ${fnError.message}`);
          }
        }
        
        // Delete the conversation participants
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .delete()
          .eq('conversation_id', conversationId);
        
        if (participantsError) {
          console.error("Error deleting conversation participants:", participantsError);
        }
        
        // Delete the conversation itself
        const { error: convError } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId);
        
        if (convError) {
          console.error("Error with standard delete conversation approach:", convError);
          
          // Try edge function as a fallback
          const { error: fnError } = await supabase.functions.invoke(
            'delete-conversation',
            {
              body: { conversation_id: conversationId }
            }
          );
          
          if (fnError) {
            console.error("Edge function delete conversation error:", fnError);
            throw new Error(`Failed to delete conversation: ${fnError.message}`);
          }
        }
        
        console.log("Conversation deleted successfully");
        return { success: true };
      } catch (error) {
        console.error('Error deleting conversation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Conversation deleted");
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message_requests'] });
    },
    onError: (error) => {
      toast.error("Failed to delete conversation");
      console.error('Delete conversation error:', error);
    }
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    startConversation: startConversation.mutate,
    acceptMessageRequest: acceptMessageRequest.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    deleteConversation: deleteConversation.mutate
  };
};
