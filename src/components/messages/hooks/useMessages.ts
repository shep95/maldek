
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

      // We'll simplify by creating a mock conversation list based on existing data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', currentUserId)
        .limit(10);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
      }

      // Create mock conversations from available profiles
      const mockConversations: Conversation[] = profiles.map(profile => ({
        id: `conv-${profile.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participants: [
          {
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url
          }
        ],
        unread_count: 0
      }));

      return mockConversations;
    },
    enabled: !!currentUserId,
  });

  // Get messages for selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!currentUserId || !selectedConversationId) return [];

      // Since we don't have actual messages table, return mock data
      // In a real implementation, this would fetch from the messages table
      return [] as Message[];
    },
    enabled: !!currentUserId && !!selectedConversationId,
  });

  // Get user profiles
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

  // Function to get or create a conversation with a user
  const getOrCreateConversation = async (recipientId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    // In a real implementation, this would check the database
    // For now, we'll just return a deterministic conversation ID
    return `conv-${recipientId}`;
  };

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
        // Get or create conversation
        const conversationId = await getOrCreateConversation(recipientId);
        if (!conversationId) throw new Error('Could not find or create conversation');
        
        // In a real implementation, this would insert into the database
        // For now, we'll just pretend it worked
        const newMessage = {
          id: `msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: currentUserId,
          recipient_id: recipientId,
          content,
          is_encrypted: isEncrypted,
          is_read: false,
          created_at: new Date().toISOString()
        };
        
        return { 
          success: true, 
          message: newMessage,
          conversationId
        };
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      toast.success('Message sent');
      
      // Select the conversation if not already selected
      if (selectedConversationId !== data.conversationId) {
        setSelectedConversationId(data.conversationId);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
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
