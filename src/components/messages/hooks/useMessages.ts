
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useEncryption } from "@/providers/EncryptionProvider";
import { Conversation, Message, User } from "../types/messageTypes";
import { toast } from "sonner";

export const useMessages = () => {
  const session = useSession();
  const currentUserId = session?.user?.id;
  const queryClient = useQueryClient();
  const { encryptText, decryptText, isEncryptionInitialized } = useEncryption();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Get current user conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      // In a real implementation, you would fetch this from the database
      // This is a placeholder until we create the conversations table
      return [] as Conversation[];
    },
    enabled: !!currentUserId,
  });

  // Get messages for selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!currentUserId || !selectedConversationId) return [];

      // In a real implementation, you would fetch this from the database
      // This is a placeholder until we create the messages table
      return [] as Message[];
    },
    enabled: !!currentUserId && !!selectedConversationId,
  });

  // Get user details
  const { data: users = {}, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['message_users', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return {};

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .not('id', 'eq', currentUserId);

      if (error) {
        console.error('Error fetching users:', error);
        return {};
      }

      // Convert to a map for easier lookup
      return data.reduce((acc: Record<string, User>, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
    },
    enabled: !!currentUserId,
  });

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({ 
      recipientId, 
      content, 
      isEncrypted = false 
    }: { 
      recipientId: string; 
      content: string;
      isEncrypted?: boolean;
    }) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        let finalContent = content;
        
        // Encrypt the message if requested
        if (isEncrypted) {
          if (!isEncryptionInitialized) {
            throw new Error('Encryption not initialized');
          }
          const encrypted = await encryptText(content);
          if (!encrypted) {
            throw new Error('Failed to encrypt message');
          }
          finalContent = encrypted;
        }
        
        // In a real implementation, you would insert this into the database
        // This is a placeholder until we create the messages table
        console.log('Sending message:', {
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: finalContent,
          is_encrypted: isEncrypted
        });
        
        // For now, we'll just simulate a successful message send
        return { 
          success: true, 
          message: {
            id: Date.now().toString(),
            sender_id: currentUserId,
            recipient_id: recipientId,
            content: finalContent,
            is_encrypted: isEncrypted,
            created_at: new Date().toISOString(),
            is_read: false
          }
        };
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      toast.success('Message sent');
      
      // Optimistically update the UI
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  });

  return {
    conversations,
    messages,
    users,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingUsers,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage: sendMessage.mutate,
    isEncryptionInitialized
  };
};
