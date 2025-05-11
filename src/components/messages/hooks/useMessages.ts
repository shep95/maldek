
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
        .limit(8);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
      }

      // Create mock conversations from available profiles
      const mockConversations: Conversation[] = profiles.map((profile, index) => ({
        id: `conv-${profile.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date(Date.now() - index * 3600000).toISOString(),
        participants: [
          {
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url
          }
        ],
        unread_count: Math.random() > 0.7 ? 1 : 0,
        last_message: {
          id: `msg-last-${profile.id}`,
          content: `Latest message from ${profile.username}`,
          sender_id: profile.id,
          recipient_id: currentUserId,
          created_at: new Date(Date.now() - index * 3600000).toISOString(),
          is_read: Math.random() > 0.7 ? false : true,
          conversation_id: `conv-${profile.id}`,
          is_encrypted: false
        }
      }));

      return mockConversations;
    },
    enabled: !!currentUserId,
  });

  // Get message requests (messages from users you don't follow)
  const { data: requestedConversations = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['message_requests', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      // Mock data for message requests
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', currentUserId)
        .limit(3);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
      }

      // Create mock requested conversations
      const mockRequestedConversations: Conversation[] = profiles.map((profile, index) => ({
        id: `req-${profile.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date(Date.now() - index * 7200000).toISOString(),
        participants: [
          {
            id: `request-${profile.id}`,
            username: `Request_${profile.username}`,
            avatar_url: profile.avatar_url
          }
        ],
        unread_count: 1,
        last_message: {
          id: `msg-req-${profile.id}`,
          content: `Hi there! Can we connect?`,
          sender_id: `request-${profile.id}`,
          recipient_id: currentUserId,
          created_at: new Date(Date.now() - index * 7200000).toISOString(),
          is_read: false,
          conversation_id: `req-${profile.id}`,
          is_encrypted: false
        }
      }));

      return mockRequestedConversations;
    },
    enabled: !!currentUserId,
  });

  // Get messages for selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!currentUserId || !selectedConversationId) return [];

      // Generate mock messages for the selected conversation
      const allConversations = [...conversations, ...requestedConversations];
      const selectedConv = allConversations.find(c => c.id === selectedConversationId);
      
      if (!selectedConv) return [];
      
      const otherUser = selectedConv.participants[0];
      
      // Generate mock message history
      const mockMessages: Message[] = [];
      const messageCount = Math.floor(Math.random() * 10) + 3; // 3-12 messages
      const now = Date.now();
      
      for (let i = 0; i < messageCount; i++) {
        const isFromOther = i % 2 === 0;
        const timeOffset = (messageCount - i) * 10 * 60 * 1000; // 10 minutes between messages
        
        mockMessages.push({
          id: `msg-${selectedConversationId}-${i}`,
          content: isFromOther 
            ? `Message ${i + 1} from ${otherUser.username}`
            : `My reply ${i + 1}`,
          sender_id: isFromOther ? otherUser.id : currentUserId,
          recipient_id: isFromOther ? currentUserId : otherUser.id,
          created_at: new Date(now - timeOffset).toISOString(),
          is_read: true,
          conversation_id: selectedConversationId,
          is_encrypted: false
        });
      }
      
      return mockMessages;
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
  const getOrCreateConversation = async (recipientId: string, isFollowing: boolean): Promise<string | null> => {
    if (!currentUserId) return null;

    // In a real implementation, this would check the database
    // For now, we'll create different IDs based on follow status
    return isFollowing ? `conv-${recipientId}` : `req-${recipientId}`;
  };

  // Start a new conversation with a user
  const startConversation = useMutation({
    mutationFn: async ({ 
      recipientId, 
      isFollowing 
    }: { 
      recipientId: string; 
      isFollowing: boolean;
    }) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        // Get or create conversation based on follow status
        const conversationId = await getOrCreateConversation(recipientId, isFollowing);
        if (!conversationId) throw new Error('Could not create conversation');
        
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
      setSelectedConversationId(data.conversationId);
      
      // If this is a mobile view, also hide the conversations list
      if (window.innerWidth < 768) {
        // This would be handled in the Messages component
      }
    },
    onError: (error) => {
      toast.error('Failed to start conversation');
      console.error('Start conversation error:', error);
    }
  });

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({ 
      recipientId, 
      content, 
      isEncrypted = false,
      isFollowing = false
    }: { 
      recipientId: string; 
      content: string;
      isEncrypted?: boolean;
      isFollowing?: boolean;
    }) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        // Get or create conversation based on whether recipient follows current user
        const conversationId = await getOrCreateConversation(recipientId, isFollowing);
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
      queryClient.invalidateQueries({ queryKey: ['message_requests', currentUserId] });
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  });

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!currentUserId) throw new Error('Not authenticated');
      
      try {
        // In a real implementation, this would delete from the database
        // For now, we'll just pretend it worked
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting conversation:', error);
        throw error;
      }
    },
    onSuccess: (data, conversationId) => {
      toast.success('Conversation deleted for all participants');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['message_requests', currentUserId] });
    },
    onError: (error) => {
      toast.error('Failed to delete conversation');
      console.error('Delete conversation error:', error);
    }
  });

  return {
    conversations,
    requestedConversations,
    messages,
    users,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingUsers,
    selectedConversationId,
    setSelectedConversationId,
    startConversation: startConversation.mutate,
    sendMessage: sendMessage.mutate,
    deleteConversation: deleteConversation.mutate,
    isEncryptionInitialized
  };
};
