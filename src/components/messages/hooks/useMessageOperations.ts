import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useMessageOperations = (currentUserId: string | null, recipientId: string) => {
  const sendMessage = async (content: string, replyToId?: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      console.log('Sending message');
      const newMessage = {
        sender_id: currentUserId,
        recipient_id: recipientId, // Add recipient_id
        content: content.trim(),
        status: 'sent',
        reply_to_id: replyToId || null,
        reactions: {},
        is_edited: false
      };

      const { error } = await supabase
        .from('messages')
        .insert(newMessage);

      if (error) throw error;

      console.log('Message sent successfully');
      toast.success("Message sent");
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error("Failed to send message");
      throw error;
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error("Failed to update message status");
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentUserId) return;

    try {
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      const reactions = message?.reactions as Record<string, string[]> || {};
      if (!reactions[emoji]) reactions[emoji] = [];
      
      const userIndex = reactions[emoji].indexOf(currentUserId);
      if (userIndex > -1) {
        reactions[emoji].splice(userIndex, 1);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji].push(currentUserId);
      }

      const { error: updateError } = await supabase
        .from('messages')
        .update({ reactions })
        .eq('id', messageId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', currentUserId);

      if (error) throw error;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ removed_by_recipient: true })
        .eq('id', messageId)
        .eq('sender_id', currentUserId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  return {
    sendMessage,
    updateMessageStatus,
    addReaction,
    editMessage,
    deleteMessage
  };
};