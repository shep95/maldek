
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Message, User } from "./types/messageTypes";

interface MessageThreadProps {
  messages: Message[];
  currentUser: User;
  recipient: User;
  onSendMessage: (content: string) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUser,
  recipient,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = React.useState("");
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b pb-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={recipient.avatar_url || undefined} />
            <AvatarFallback>{recipient.username[0]?.toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <h2 className="font-semibold">{recipient.username}</h2>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-grow mb-4 pr-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender_id === currentUser.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={recipient.avatar_url || undefined} />
                        <AvatarFallback>{recipient.username[0]?.toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`rounded-lg p-3 ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.is_encrypted && message.decrypted_content ? (
                        <>
                          <p>{message.decrypted_content}</p>
                          <span className="text-xs opacity-70 mt-1">🔒 Encrypted</span>
                        </>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                    
                    {isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar_url || undefined} />
                        <AvatarFallback>{currentUser.username[0]?.toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="mt-auto">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
