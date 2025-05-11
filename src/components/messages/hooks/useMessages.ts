
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

      const { data: conversationParticipants, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation:conversation_id (
            id,
            created_at,
            updated_at,
            last_message:last_message_id (
              id,
              content,
              created_at,
              sender_id,
              recipient_id,
              is_read,
              is_encrypted
            )
          )
        `)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      // Get all unique conversation IDs
      const conversationIds = conversationParticipants
        .map(cp => cp.conversation.id)
        .filter((id, index, self) => self.indexOf(id) === index);

      // For each conversation, get participants
      const conversationsWithParticipants: Conversation[] = [];
      
      for (const convId of conversationIds) {
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select(`
            user:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq('conversation_id', convId);

        if (participantsError) {
          console.error('Error fetching participants:', participantsError);
          continue;
        }

        // Find the conversation data from our first query
        const conversationData = conversationParticipants.find(
          cp => cp.conversation.id === convId
        )?.conversation;

        if (conversationData) {
          // Count unread messages
          const { data: unreadCount, error: unreadError } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', convId)
            .eq('recipient_id', currentUserId)
            .eq('is_read', false);

          const userParticipants = participants
            .map(p => p.user)
            .filter(Boolean) as User[];

          conversationsWithParticipants.push({
            id: conversationData.id,
            created_at: conversationData.created_at,
            updated_at: conversationData.updated_at,
            last_message: conversationData.last_message || undefined,
            participants: userParticipants,
            unread_count: unreadCount?.count || 0
          });
        }
      }

      return conversationsWithParticipants.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    },
    enabled: !!currentUserId,
  });

  // Get messages for selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!currentUserId || !selectedConversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          conversation_id,
          sender_id,
          recipient_id,
          is_read,
          is_encrypted,
          sender:sender_id (
            id,
            username,
            avatar_url
          ),
          recipient:recipient_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', selectedConversationId)
        .order('created_at');

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Mark messages as read
      if (data.length > 0) {
        const unreadMessages = data.filter(
          m => m.recipient_id === currentUserId && !m.is_read
        );
        
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', selectedConversationId)
            .eq('recipient_id', currentUserId)
            .eq('is_read', false);
        }
      }

      // Decrypt encrypted messages if possible
      if (isEncryptionInitialized) {
        const decryptedMessages = await Promise.all(
          data.map(async (message) => {
            if (message.is_encrypted) {
              try {
                const decrypted = await decryptText(message.content);
                return {
                  ...message,
                  decrypted_content: decrypted
                };
              } catch (error) {
                console.error('Error decrypting message:', error);
                return message;
              }
            }
            return message;
          })
        );
        
        return decryptedMessages;
      }

      return data;
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

  // Start a new conversation or get existing one
  const getOrCreateConversation = async (recipientId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    // Check if conversation already exists between these users
    const { data: existingParticipants, error: existingError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (existingError) {
      console.error('Error checking existing conversations:', existingError);
      return null;
    }

    if (existingParticipants.length > 0) {
      const conversationIds = existingParticipants.map(p => p.conversation_id);
      
      const { data: matchedParticipants, error: matchError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipientId)
        .in('conversation_id', conversationIds);
      
      if (!matchError && matchedParticipants.length > 0) {
        // Conversation exists
        return matchedParticipants[0].conversation_id;
      }
    }

    // Create new conversation
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError || !newConversation) {
      console.error('Error creating conversation:', convError);
      return null;
    }

    // Add participants
    const participants = [
      { conversation_id: newConversation.id, user_id: currentUserId },
      { conversation_id: newConversation.id, user_id: recipientId }
    ];
    
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantError) {
      console.error('Error adding participants:', participantError);
      return null;
    }

    return newConversation.id;
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
        
        // Insert message
        const { data: newMessage, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            recipient_id: recipientId,
            content: finalContent,
            is_encrypted: isEncrypted
          })
          .select()
          .single();
        
        if (error) throw error;
        
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
