
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Conversation } from "./types/messageTypes";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No conversations yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          // Find the other participant (not the current user)
          const otherParticipant = conversation.participants[0];
          
          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors ${
                selectedConversationId === conversation.id ? "bg-accent" : ""
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                <AvatarFallback>
                  {otherParticipant?.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">
                    {otherParticipant?.username || "Unknown"}
                  </span>
                  {conversation.last_message && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                {conversation.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message.is_encrypted 
                      ? "🔒 Encrypted message"
                      : conversation.last_message.content}
                  </p>
                )}
                
                {conversation.unread_count > 0 && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground">
                    {conversation.unread_count}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
