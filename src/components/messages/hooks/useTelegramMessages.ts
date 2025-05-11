
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { secureLog } from "@/utils/secureLogging";
import { toast } from "sonner";

export const useTelegramMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const session = useSession();

  // Parse the conversation ID to get user IDs
  const parseConversationId = useCallback(() => {
    if (!conversationId || !session?.user?.id) return null;
    
    const parts = conversationId.split('-');
    if (parts.length !== 2) return null;
    
    const [userId1, userId2] = parts;
    const otherUserId = userId1 === session.user.id ? userId2 : userId1;
    
    return {
      currentUserId: session.user.id,
      otherUserId
    };
  }, [conversationId, session?.user?.id]);

  // Fetch messages for the current conversation
  const fetchMessages = useCallback(async () => {
    const parsedIds = parseConversationId();
    if (!parsedIds) return;
    
    const { currentUserId, otherUserId } = parsedIds;

    try {
      setIsLoading(true);
      setError(null);
      
      // Get messages between these two users
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      
      setMessages(data || []);
      
      // Mark messages from other user as read
      const unreadMessages = (data || []).filter(
        msg => !msg.read_at && msg.sender_id === otherUserId
      );
      
      if (unreadMessages.length > 0) {
        await Promise.all(unreadMessages.map(msg => 
          supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("id", msg.id)
        ));
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      secureLog(err, { level: "error" });
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    } finally {
      setIsLoading(false);
    }
  }, [parseConversationId]);

  // Listen for new messages using Supabase Realtime
  useEffect(() => {
    const parsedIds = parseConversationId();
    if (!parsedIds) return;
    
    const { currentUserId, otherUserId } = parsedIds;
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId}))`
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as any;
            
            setMessages(prevMessages => {
              // Check if the message already exists
              if (prevMessages.some(msg => msg.id === newMessage.id)) {
                return prevMessages;
              }
              return [...prevMessages, newMessage];
            });
            
            // Mark message as read if it's not from the current user
            if (newMessage.sender_id !== currentUserId) {
              supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", newMessage.id);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedMessage = payload.new as any;
            
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages, parseConversationId]);

  // Send message function
  const sendMessage = async (content: string): Promise<boolean> => {
    const parsedIds = parseConversationId();
    if (!parsedIds) {
      toast.error("Unable to send message");
      return false;
    }
    
    const { currentUserId, otherUserId } = parsedIds;

    try {
      // Insert the new message
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          recipient_id: otherUserId,
          content,
          status: 'sent'
        });
      
      if (messageError) throw messageError;
      
      secureLog(`Message sent to user ${otherUserId}`, { level: "info" });
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      secureLog(err, { level: "error" });
      toast.error("Failed to send message");
      return false;
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages: fetchMessages
  };
};
