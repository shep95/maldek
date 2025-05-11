
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEncryption } from "@/providers/EncryptionProvider";
import { useSession } from "@supabase/auth-helpers-react";
import { secureFetch, secureLog } from "@/utils/secureLogging";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types/database";

// Define types that match our database schema
type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  file_url?: string | null;
  file_type?: string | null;
  file_name?: string | null;
  encrypted_metadata?: string | null;
};

export const useTelegramMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const session = useSession();
  const encryption = useEncryption();

  // Fetch messages for the current conversation
  const fetchMessages = useCallback(async () => {
    if (!conversationId || !session?.user?.id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      // Convert data to our Message type
      setMessages((data || []) as Message[]);
      
      // Mark messages as read
      const unreadMessages = data?.filter(
        msg => !msg.is_read && msg.sender_id !== session.user?.id
      ) || [];
      
      if (unreadMessages.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in("id", unreadMessages.map(msg => msg.id));
        
        // Update the conversation's unread count
        await supabase
          .from("conversations")
          .update({ unread_count: 0 })
          .eq("id", conversationId)
          .eq("user_id", session.user.id);
      }
    } catch (err) {
      secureLog(err, { level: "error" });
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, session?.user?.id]);

  // Listen for new messages using Supabase Realtime
  useEffect(() => {
    if (!conversationId) return;
    
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
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as Message;
            
            setMessages(prevMessages => {
              // Check if the message already exists
              if (prevMessages.some(msg => msg.id === newMessage.id)) {
                return prevMessages;
              }
              return [...prevMessages, newMessage];
            });
            
            // Mark message as read if it's not from the current user
            if (newMessage.sender_id !== session?.user?.id) {
              supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMessage.id);
              
              // Update the conversation's unread count
              supabase
                .from("conversations")
                .update({ unread_count: 0 })
                .eq("id", conversationId)
                .eq("user_id", session?.user?.id);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedMessage = payload.new as Message;
            
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
  }, [conversationId, session?.user?.id, fetchMessages]);

  // Send message function
  const sendMessage = async (content: string, fileData?: { file: File, previewUrl?: string }): Promise<boolean> => {
    if (!conversationId || !session?.user?.id) {
      toast.error("Unable to send message");
      return false;
    }

    try {
      // Get conversation details
      const { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
      
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      
      let encryptedContent = content;
      let fileUrl: string | null = null;
      let fileType: string | null = null;
      let fileName: string | null = null;
      let encryptedMetadata = null;
      
      // Encrypt the message content if encryption is initialized
      if (encryption.isEncryptionInitialized) {
        if (content) {
          const encrypted = await encryption.encryptText(content);
          if (encrypted) {
            encryptedContent = `E2EE:${encrypted}`;
          }
        }
        
        // Handle file upload if provided
        if (fileData?.file) {
          // Upload file with encryption
          const file = fileData.file;
          fileName = file.name;
          fileType = file.type;
          
          // Generate encryption metadata
          const metadata = {
            fileName,
            fileType,
            encryptionIV: crypto.randomUUID(),
            encryptionKey: crypto.randomUUID()
          };
          
          // Encrypt file metadata
          encryptedMetadata = await encryption.encryptText(JSON.stringify(metadata));
          
          // For a real implementation, we'd encrypt the file here
          // and upload it to secure storage
          // For this example, we're skipping actual encryption
          
          const { data: uploadResult } = await supabase
            .storage
            .from('messages')
            .upload(`${session.user.id}/${crypto.randomUUID()}-${file.name}`, file);
            
          if (uploadResult?.path) {
            // Get public URL
            const { data: { publicUrl } } = supabase
              .storage
              .from('messages')
              .getPublicUrl(uploadResult.path);
              
            fileUrl = publicUrl;
          }
        }
      }
      
      // Insert the new message
      const { data: message, error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content: encryptedContent,
          is_read: false,
          file_url: fileUrl,
          file_type: fileType,
          file_name: fileName,
          encrypted_metadata: encryptedMetadata
        })
        .select()
        .single();
      
      if (messageError) throw messageError;

      // Update the conversation with last message
      await supabase
        .from("conversations")
        .update({
          last_message: content ? content.substring(0, 50) : "Sent an attachment",
          last_message_at: new Date().toISOString(),
          // Increment unread count for the recipient
          unread_count: conversation.user_id !== session.user.id
            ? conversation.unread_count + 1
            : conversation.unread_count
        })
        .eq("id", conversationId);
        
      // If there's a participant_id, update their copy of the conversation too
      if (conversation.participant_id) {
        // Check if the participant has a copy of this conversation
        const { data: participantConvo } = await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", conversation.participant_id)
          .eq("participant_id", session.user.id)
          .single();
          
        if (participantConvo) {
          // Update the participant's conversation
          await supabase
            .from("conversations")
            .update({
              last_message: content ? content.substring(0, 50) : "Sent an attachment",
              last_message_at: new Date().toISOString(),
              unread_count: participantConvo.unread_count + 1
            })
            .eq("id", participantConvo.id);
        } else {
          // Create a new conversation for the participant
          await supabase
            .from("conversations")
            .insert({
              name: session.user.email || session.user.id,
              user_id: conversation.participant_id,
              participant_id: session.user.id,
              last_message: content ? content.substring(0, 50) : "Sent an attachment",
              last_message_at: new Date().toISOString(),
              unread_count: 1,
              encrypted_metadata: conversation.encrypted_metadata,
              is_group: conversation.is_group
            });
        }
      }
      
      // Send Telegram notification using the edge function
      // This would integrate with the Telegram API
      // but for now we'll just log it
      secureLog(`Message sent to conversation ${conversationId}`, { level: "info" });
      
      return true;
    } catch (err) {
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
