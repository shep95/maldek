
import { useEffect, useState } from "react";
import { Conversation, Message } from "../types/messageTypes";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requestedConversations, setRequestedConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();
  const currentUserId = session?.user?.id;
  const { toast } = useToast();

  // Fetch initial conversations data
  useEffect(() => {
    if (!currentUserId) return;

    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        // Fetch regular conversations (with users who follow each other)
        const { data: regularConvData, error: regularError } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            updated_at,
            participants:conversation_participants(user_id, profiles(id, username, avatar_url)),
            last_message:messages(id, content, sender_id, recipient_id, created_at, is_read, conversation_id, is_encrypted)
          `)
          .eq('is_request', false)
          .contains('participant_ids', [currentUserId])
          .order('updated_at', { ascending: false });

        if (regularError) throw regularError;

        // Fetch message requests (conversations where users don't follow each other)
        const { data: requestConvData, error: requestError } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            updated_at,
            participants:conversation_participants(user_id, profiles(id, username, avatar_url)),
            last_message:messages(id, content, sender_id, recipient_id, created_at, is_read, conversation_id, is_encrypted)
          `)
          .eq('is_request', true)
          .contains('participant_ids', [currentUserId])
          .order('updated_at', { ascending: false });

        if (requestError) throw requestError;

        // Process conversations to match our data structure
        const processedRegularConversations = regularConvData?.map(processConversation) || [];
        const processedRequestConversations = requestConvData?.map(processConversation) || [];

        setConversations(processedRegularConversations);
        setRequestedConversations(processedRequestConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [currentUserId, toast]);

  // Set up real-time listeners for conversations and messages
  useEffect(() => {
    if (!currentUserId) return;

    // Real-time updates for conversations
    const conversationChannel = supabase
      .channel('conversation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_ids=cs.{${currentUserId}}`
        },
        (payload) => {
          console.log('Conversation update:', payload);
          // Refresh conversations on update
          refreshConversations();
        }
      )
      .subscribe();

    // Real-time updates for messages
    const messageChannel = supabase
      .channel('message-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as any;
          
          // If the message belongs to the currently selected conversation, add it to the messages state
          if (newMessage.conversation_id === selectedConversationId) {
            setMessages(prev => [...prev, formatMessage(newMessage)]);
          }
          
          // Update unread count and update conversations
          refreshConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [currentUserId]);

  // Helper function to process conversation data from Supabase
  const processConversation = (conv: any): Conversation => {
    // Find the other participant (not current user)
    const participants = conv.participants.map((p: any) => ({
      id: p.profiles.id,
      username: p.profiles.username,
      avatar_url: p.profiles.avatar_url
    }));

    // Calculate unread count
    const unreadCount = conv.last_message?.filter((msg: any) => 
      msg.recipient_id === currentUserId && !msg.is_read
    ).length || 0;

    return {
      id: conv.id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      participants: participants.filter((p: any) => p.id !== currentUserId),
      unread_count: unreadCount,
      last_message: conv.last_message && conv.last_message.length > 0 
        ? formatMessage(conv.last_message[0]) 
        : undefined
    };
  };

  // Helper function to format message data
  const formatMessage = (msg: any): Message => {
    return {
      id: msg.id,
      content: msg.content,
      sender_id: msg.sender_id,
      recipient_id: msg.recipient_id,
      created_at: msg.created_at,
      is_read: msg.is_read,
      conversation_id: msg.conversation_id,
      is_encrypted: msg.is_encrypted
    };
  };

  // Function to refresh conversations
  const refreshConversations = async () => {
    if (!currentUserId) return;

    try {
      // Same queries as in the initial fetch
      const { data: regularConvData } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          participants:conversation_participants(user_id, profiles(id, username, avatar_url)),
          last_message:messages(id, content, sender_id, recipient_id, created_at, is_read, conversation_id, is_encrypted)
        `)
        .eq('is_request', false)
        .contains('participant_ids', [currentUserId])
        .order('updated_at', { ascending: false });

      const { data: requestConvData } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          participants:conversation_participants(user_id, profiles(id, username, avatar_url)),
          last_message:messages(id, content, sender_id, recipient_id, created_at, is_read, conversation_id, is_encrypted)
        `)
        .eq('is_request', true)
        .contains('participant_ids', [currentUserId])
        .order('updated_at', { ascending: false });

      // Process conversations
      const processedRegularConversations = regularConvData?.map(processConversation) || [];
      const processedRequestConversations = requestConvData?.map(processConversation) || [];

      setConversations(processedRegularConversations);
      setRequestedConversations(processedRequestConversations);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    if (!currentUserId || !conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages(data?.map(formatMessage) || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', currentUserId);

      // Refresh conversations to update unread counts
      refreshConversations();
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // State for selected conversation
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Update messages when selected conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  return {
    conversations,
    requestedConversations,
    messages,
    isLoading,
    selectedConversationId,
    setSelectedConversationId,
    refreshConversations
  };
};

