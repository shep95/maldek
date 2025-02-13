
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
import { toast } from "sonner";

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
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    updateMessageStatus,
    addReaction,
    editMessage,
    deleteMessage
  } = useChatMessages(session?.user?.id || null, recipientId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleViewProfile = () => {
    navigate(`/@${recipientName}`);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
      toast.success("Reaction added");
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error("Failed to add reaction");
    }
  };

  const handleEdit = async (messageId: string, content: string) => {
    try {
      await editMessage(messageId, content);
      setEditingMessage(null);
      toast.success("Message updated");
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error("Failed to edit message");
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <ReplyContext.Provider value={{ replyingTo, setReplyingTo }}>
      <div className="flex flex-col h-[calc(100vh-16rem)] bg-gradient-to-b from-background to-background/95">
        <ChatHeader
          recipientName={recipientName}
          onViewProfile={handleViewProfile}
          isOnline={true}
        />
        <ScrollArea 
          ref={scrollRef} 
          className="flex-1 px-4 scrollbar-custom"
        >
          <div className="space-y-6 py-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <MessageDateSeparator date={date} />
                <div className="space-y-2">
                  {dateMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isCurrentUser={message.sender_id === session?.user?.id}
                      onReply={() => setReplyingTo(message)}
                      onReaction={(emoji) => handleReaction(message.id, emoji)}
                      onEdit={() => setEditingMessage(message)}
                      onDelete={() => handleDelete(message.id)}
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
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </div>
    </ReplyContext.Provider>
  );
};
