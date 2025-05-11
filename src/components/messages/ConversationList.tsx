
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Conversation } from "./types/messageTypes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  isRequestTab?: boolean;
  onAcceptRequest?: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isRequestTab = false,
  onAcceptRequest,
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
    <ScrollArea className="h-full pr-2 hide-scrollbar">
      <div className="space-y-2 sm:space-y-3">
        {conversations.map((conversation) => {
          // Find the other participant (not the current user)
          const otherParticipant = conversation.participants[0];
          const hasUnread = conversation.unread_count > 0;
          
          return (
            <div key={conversation.id} className="relative">
              <button
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors touch-target",
                  selectedConversationId === conversation.id 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/10",
                  hasUnread && "font-medium",
                  isRequestTab && "border-l-2 border-primary"
                )}
              >
                <Avatar className="h-11 w-11 sm:h-12 sm:w-12 border flex-shrink-0">
                  <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                  <AvatarFallback className="font-medium text-base">
                    {otherParticipant?.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 overflow-hidden min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={cn("truncate text-base font-medium", hasUnread && "font-semibold")}>
                      {otherParticipant?.username || "Unknown"}
                    </span>
                    {conversation.updated_at && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatTime(conversation.updated_at)}
                      </span>
                    )}
                  </div>
                  
                  {/* New message indicator dot instead of message preview text */}
                  {hasUnread && (
                    <div className="h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse mt-1"></div>
                  )}
                </div>
              </button>
              
              {/* Accept button for message requests */}
              {isRequestTab && onAcceptRequest && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcceptRequest(conversation.id);
                  }}
                  title="Accept message request"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

// Helper function to format time in a more human-readable way
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
