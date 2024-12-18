import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/types/messages";
import { useMessageSubscription } from './useMessageSubscription';
import { useMessageOperations } from './useMessageOperations';
import { useMessageQueries } from './useMessageQueries';

export const useChatMessages = (currentUserId: string | null, recipientId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchMessages } = useMessageQueries(currentUserId, recipientId, setMessages);
  const { handleSubscription } = useMessageSubscription(fetchMessages);
  const { sendMessage, updateMessageStatus, addReaction, editMessage, deleteMessage } = useMessageOperations(currentUserId, recipientId);

  useEffect(() => {
    fetchMessages();
    const cleanup = handleSubscription();
    return () => {
      cleanup();
    };
  }, [currentUserId, recipientId]);

  return {
    messages,
    isLoading,
    sendMessage,
    updateMessageStatus,
    addReaction,
    editMessage,
    deleteMessage
  };
};