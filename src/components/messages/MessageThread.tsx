
import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as MessageType, User } from "./types/messageTypes";
import { format } from "date-fns";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

interface MessageThreadProps {
  messages: MessageType[];
  currentUserId?: string;
  currentUser?: { id: string; username: string }; // Make this optional to support both prop formats
  recipient?: User;
  users?: Record<string, User>;
  onSendMessage?: (content: string) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  currentUser,
  recipient,
  users = {},
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const actualCurrentUserId = currentUser?.id || currentUserId;

  useEffect(() => {
    // Scroll to the bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b pb-4 mb-4">
          <h2 className="font-semibold">
            {recipient ? `Chat with ${recipient.username}` : "Messages"}
          </h2>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message below</p>
        </div>
        
        {onSendMessage && (
          <form onSubmit={handleSendMessage} className="mt-auto p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b pb-4 mb-4">
        <h2 className="font-semibold">
          {recipient ? `Chat with ${recipient.username}` : "Messages"}
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {messages.map((message) => {
            const isSentByMe = message.sender_id === actualCurrentUserId;
            const sender = isSentByMe 
              ? (currentUser?.username || "You") 
              : (recipient?.username || users[message.sender_id]?.username || "Unknown");
            const senderAvatar = !isSentByMe 
              ? (recipient?.avatar_url || users[message.sender_id]?.avatar_url) 
              : undefined;

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
      </div>

      {onSendMessage && (
        <form onSubmit={handleSendMessage} className="mt-auto p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
