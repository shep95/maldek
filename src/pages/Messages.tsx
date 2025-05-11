
import { useState, useEffect } from "react";
import { ConversationList } from "../components/messages/ConversationList";
import { MessagePanel } from "../components/messages/MessagePanel";
import { useTelegramMessages } from "../components/messages/hooks/useTelegramMessages";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { secureLog } from "@/utils/secureLogging";

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages, isLoading, sendMessage } = useTelegramMessages(selectedConversationId);
  const session = useSession();

  // Reset unread count when selecting a conversation
  useEffect(() => {
    const resetUnreadCount = async () => {
      if (!selectedConversationId || !session?.user?.id) return;
      
      try {
        await supabase
          .from("conversations" as any)
          .update({ unread_count: 0 })
          .eq("id", selectedConversationId)
          .eq("user_id", session.user.id);
      } catch (error) {
        secureLog(error, { level: "error" });
      }
    };
    
    resetUnreadCount();
  }, [selectedConversationId, session?.user?.id]);

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <div className="md:grid md:grid-cols-[320px_1fr] h-[100dvh]">
          <div className="flex flex-col border-r border-white/10 h-full">
            <ConversationList
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          </div>
          <div className="flex flex-col">
            <MessagePanel
              conversationId={selectedConversationId}
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
