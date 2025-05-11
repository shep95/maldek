
import { useState } from "react";
import { ConversationList } from "../components/messages/ConversationList";
import { MessagePanel } from "../components/messages/MessagePanel";
import { useTelegramMessages } from "../components/messages/hooks/useTelegramMessages";

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages, isLoading, sendMessage } = useTelegramMessages(selectedConversationId);

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <div className="md:grid md:grid-cols-[320px_1fr] h-[100dvh]">
          <div className="hidden md:flex md:flex-col border-r border-white/10 h-full">
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
