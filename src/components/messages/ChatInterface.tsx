import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";
import { MessageDateSeparator } from "./MessageDateSeparator";
import { groupMessagesByDate } from "./utils/messageUtils";
import { ReplyContext } from "./context/ReplyContext";
import { Message } from "@/types/messages";

interface ChatInterfaceProps {
  recipientId: string;
  recipientName: string;
}

export const ChatInterface = ({
  recipientId,
  recipientName,
}: ChatInterfaceProps) => {
  const session = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  const { messages, isLoading, sendMessage, updateMessageStatus } = useChatMessages(session?.user?.id || null, recipientId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleViewProfile = () => {
    navigate(`/@${recipientName}`);
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <ReplyContext.Provider value={{ replyingTo, setReplyingTo }}>
      <div className="flex flex-col h-[calc(100vh-16rem)]">
        <ChatHeader
          recipientName={recipientName}
          onViewProfile={handleViewProfile}
          isOnline={true} // TODO: Implement online status
        />
        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="space-y-4 p-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <MessageDateSeparator date={date} />
                <div className="space-y-4">
                  {dateMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isCurrentUser={message.sender_id === session?.user?.id}
                      onReply={() => setReplyingTo(message)}
                      onStatusUpdate={updateMessageStatus}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <ChatInput 
          onSendMessage={sendMessage} 
          isLoading={isLoading}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </ReplyContext.Provider>
  );
};