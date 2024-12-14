import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";

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
  
  const { messages, isLoading, sendMessage } = useChatMessages(session?.user?.id || null, recipientId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleViewProfile = () => {
    navigate(`/@${recipientName}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <ChatHeader
        recipientName={recipientName}
        onViewProfile={handleViewProfile}
      />
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              timestamp={message.created_at}
              isCurrentUser={message.sender_id === session?.user?.id}
              senderName={message.sender.username}
              senderAvatar={message.sender.avatar_url}
            />
          ))}
        </div>
      </ScrollArea>
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
};