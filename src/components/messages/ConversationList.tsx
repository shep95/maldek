import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "./types/messageTypes";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  isRequestTab?: boolean;
  showPreview?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isRequestTab = false,
  showPreview = true,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {isRequestTab 
          ? "No message requests" 
          : "No conversations yet"}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-2 sm:space-y-3">
        {conversations.map((conversation) => {
          // Find the other participant (not the current user)
          const otherParticipant = conversation.participants[0];
          const hasUnread = conversation.unread_count > 0;
          
          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2 sm:p-3 rounded-lg text-left transition-colors",
                selectedConversationId === conversation.id 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent/10",
                hasUnread && "font-medium",
                isRequestTab && "border-l-2 border-primary"
              )}
            >
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                <AvatarFallback className="font-medium">
                  {otherParticipant?.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex justify-between items-center">
                  <span className={cn("truncate text-sm sm:text-base", hasUnread && "font-semibold")}>
                    {otherParticipant?.username || "Unknown"}
                  </span>
                  {hasUnread && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 ml-2"></div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

// Helper function to format time in a more human-readable way like the reference
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  // If it's today, show the time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If it's yesterday, show "Yesterday"
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  // If it's this week, show the day name
  if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }
  
  // Otherwise, show the date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
