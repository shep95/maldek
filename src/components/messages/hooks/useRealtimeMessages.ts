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
  
  // State for selected conversation - moved up before it's used in the useEffect below
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Fetch initial conversations data
  useEffect(() => {
    if (!currentUserId) return;

    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        // Modified query to avoid using direct relationships between conversation_participants and profiles
        // Instead, we'll first get the conversation data with participants
        const { data: regularConvData, error: regularError } = await supabase
          .from("conversations")
          .select(`
            id,
            created_at,
            updated_at,
            participant_ids
          `)
          .eq('is_request', false)
          .contains('participant_ids', [currentUserId])
          .order('updated_at', { ascending: false });

        if (regularError) throw regularError;

        // Fetch message requests (conversations where users don't follow each other)
        const { data: requestConvData, error: requestError } = await supabase
          .from("conversations")
          .select(`
            id,
            created_at,
            updated_at,
            participant_ids
          `)
          .eq('is_request', true)
          .contains('participant_ids', [currentUserId])
          .order('updated_at', { ascending: false });

        if (requestError) throw requestError;

        // Process conversations to match our data structure
        const processedRegularConversations = await Promise.all(regularConvData?.map(processConversation) || []);
        const processedRequestConversations = await Promise.all(requestConvData?.map(processConversation) || []);

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
  }, [currentUserId, selectedConversationId]);

  // Helper function to process conversation data from Supabase
  const processConversation = async (conv: any): Promise<Conversation> => {
    // Get the other participant (not current user)
    const otherParticipantId = conv.participant_ids.find((id: string) => id !== currentUserId);
    
    // Fetch the other participant's profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", otherParticipantId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    // Fetch unread messages count
    const { data: unreadMessages, error: unreadError } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conv.id)
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);
    
    if (unreadError) {
      console.error('Error fetching unread count:', unreadError);
    }
    
    // Fetch last message
    const { data: lastMessages, error: lastMessageError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (lastMessageError) {
      console.error('Error fetching last message:', lastMessageError);
    }

    return {
      id: conv.id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      participants: profileData ? [profileData] : [],
      unread_count: unreadMessages?.length || 0,
      last_message: lastMessages && lastMessages.length > 0 
        ? formatMessage(lastMessages[0]) 
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
      // Same queries as in the initial fetch but with updated approach
      const { data: regularConvData } = await supabase
        .from("conversations")
        .select(`
          id,
          created_at,
          updated_at,
          participant_ids
        `)
        .eq('is_request', false)
        .contains('participant_ids', [currentUserId])
        .order('updated_at', { ascending: false });

      const { data: requestConvData } = await supabase
        .from("conversations")
        .select(`
          id,
          created_at,
          updated_at,
          participant_ids
        `)
        .eq('is_request', true)
        .contains('participant_ids', [currentUserId])
        .order('updated_at', { ascending: false });

      // Process conversations
      const processedRegularConversations = await Promise.all(regularConvData?.map(processConversation) || []);
      const processedRequestConversations = await Promise.all(requestConvData?.map(processConversation) || []);

      // If the selected conversation was a request and now it's not, update the state
      if (selectedConversationId) {
        const wasRequest = requestedConversations.some(c => c.id === selectedConversationId);
        const isNowRegular = processedRegularConversations.some(c => c.id === selectedConversationId);
        
        if (wasRequest && isNowRegular) {
          // Reload messages for this conversation as it transitioned from request to regular
          loadMessages(selectedConversationId);
        }
      }

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
        .from("messages")
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages(data?.map(formatMessage) || []);

      // Mark messages as read when viewed
      await supabase
        .from("messages")
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
