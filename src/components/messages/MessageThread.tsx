
import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as MessageType, User } from "./types/messageTypes";
import { format } from "date-fns";
import { Lock } from "lucide-react";

interface MessageThreadProps {
  messages: MessageType[];
  currentUserId: string | undefined;
  users: Record<string, User>;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  users,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No messages yet</p>
        <p className="text-sm">Start the conversation by sending a message below</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {messages.map((message) => {
        const isSentByMe = message.sender_id === currentUserId;
        const sender = isSentByMe ? "You" : users[message.sender_id]?.username || "Unknown";
        const senderAvatar = !isSentByMe ? users[message.sender_id]?.avatar_url : undefined;

        return (
          <div
            key={message.id}
            className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-2 max-w-[80%] ${isSentByMe ? "flex-row-reverse" : ""}`}>
              {!isSentByMe && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={senderAvatar || undefined} />
                  <AvatarFallback>{sender[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <div
                  className={`rounded-md p-3 ${
                    isSentByMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.is_encrypted ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Lock size={12} />
                      <span>Encrypted message</span>
                    </div>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words">
                    {message.decrypted_content || message.content}
                  </p>
                </div>
                <div
                  className={`text-xs text-muted-foreground mt-1 ${
                    isSentByMe ? "text-right" : ""
                  }`}
                >
                  {format(new Date(message.created_at), "HH:mm")}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
