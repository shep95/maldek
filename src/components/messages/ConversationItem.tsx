
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useEncryption } from "@/providers/EncryptionProvider";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conversation: any;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) => {
  const [lastMessage, setLastMessage] = useState<string>(
    conversation.last_message || "No messages yet"
  );
  const encryption = useEncryption();
  
  useEffect(() => {
    const decryptLastMessage = async () => {
      try {
        if (!conversation.last_message || !encryption.isEncryptionInitialized) return;
        
        // If the message starts with "E2EE:" it's encrypted
        if (conversation.last_message.startsWith("E2EE:")) {
          const encryptedText = conversation.last_message.substring(5);
          const decrypted = await encryption.decryptText(encryptedText);
          if (decrypted) {
            setLastMessage(decrypted);
          } else {
            setLastMessage("[Encrypted message]");
          }
        }
      } catch (error) {
        console.error("Failed to decrypt message:", error);
        setLastMessage("[Encrypted message]");
      }
    };
    
    decryptLastMessage();
  }, [conversation.last_message, encryption]);
  
  const formattedTime = conversation.last_message_at
    ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
    : "";

  // Get first letter of conversation name for avatar
  const avatarInitial = conversation.name.charAt(0).toUpperCase();
  
  // Determine if this is a group chat from metadata
  const isGroupChat = conversation.metadata?.isGroup || false;

  return (
    <div 
      onClick={onClick} 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isSelected ? "bg-accent/20" : "hover:bg-white/5"
      )}
    >
      <Avatar className={cn(
        "h-12 w-12 text-white",
        isGroupChat ? "bg-gradient-to-br from-purple-700 to-blue-500" : "bg-gradient-to-br from-accent to-accent/70"
      )}>
        <span>{avatarInitial}</span>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
        
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {lastMessage}
        </p>
      </div>
      
      {conversation.unread_count > 0 && (
        <Badge className="bg-accent/90 hover:bg-accent text-white">{conversation.unread_count}</Badge>
      )}
    </div>
  );
};
