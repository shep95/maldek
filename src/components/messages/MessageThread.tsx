import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as MessageType, User } from "./types/messageTypes";
import { format } from "date-fns";
import { ArrowLeft, Lock, Send, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MessageThreadProps {
  messages: MessageType[];
  currentUserId?: string;
  currentUser?: { id: string; username: string }; // Make this optional to support both prop formats
  recipient?: User;
  users?: Record<string, User>;
  onSendMessage?: (content: string) => void;
  onBackClick?: () => void;
  onDeleteConversation?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  currentUser,
  recipient,
  users = {},
  onSendMessage,
  onBackClick,
  onDeleteConversation
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
        <div className="border-b py-3 px-4 flex items-center justify-between">
          <div className="flex items-center">
            {onBackClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="mr-2 -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="font-semibold">
              {recipient ? `Chat with ${recipient.username}` : "Messages"}
            </h2>
          </div>
          
          {onDeleteConversation && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDeleteConversation}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex-grow flex flex-col items-center justify-center h-full text-muted-foreground p-4">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message below</p>
        </div>
        
        {onSendMessage && (
          <form onSubmit={handleSendMessage} className="mt-auto p-3 sm:p-4 border-t">
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
      <div className="border-b py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          {onBackClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="mr-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            {recipient && (
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={recipient.avatar_url || undefined} />
                <AvatarFallback>{recipient.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
            )}
            <h2 className="font-semibold">
              {recipient ? recipient.username : "Messages"}
            </h2>
          </div>
        </div>
        
        {onDeleteConversation && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDeleteConversation}
            className="text-muted-foreground hover:text-destructive"
            title="Delete conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
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
                <div className={`flex gap-2 max-w-[85%] ${isSentByMe ? "flex-row-reverse" : ""}`}>
                  {!isSentByMe && (
                    <Avatar className="h-8 w-8 hidden sm:flex mt-1">
                      <AvatarImage src={senderAvatar || undefined} />
                      <AvatarFallback>{sender[0]?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-3 py-2 ${
                        isSentByMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none"
                      }`}
                    >
                      {/* All messages now display the lock icon to indicate encryption */}
                      <div className="flex items-center gap-1 text-xs mb-1">
                        <Lock size={12} />
                        <span>Encrypted message</span>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
                        {message.decrypted_content || message.content}
                      </p>
                    </div>
                    <div
                      className={`text-xs text-muted-foreground mt-1 flex items-center ${
                        isSentByMe ? "justify-end" : ""
                      }`}
                    >
                      {format(new Date(message.created_at), "MMM d, h:mm a")}
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
        <form onSubmit={handleSendMessage} className="mt-auto p-3 sm:p-4 md:p-5 border-t">
          <div className="flex gap-2 max-w-5xl mx-auto">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
