import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ConversationItemProps {
  conversation: {
    id: string;
    name: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
    participant_id: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) => {
  const [participantName, setParticipantName] = useState<string>("User");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load participant details from their user ID
  useEffect(() => {
    const loadParticipantDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", conversation.participant_id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setParticipantName(data.username || "User");
          setAvatarUrl(data.avatar_url);
        }
      } catch (err) {
        console.error("Error loading participant details:", err);
      }
    };
    
    if (conversation.participant_id) {
      loadParticipantDetails();
    }
  }, [conversation.participant_id]);
  
  // Format the timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors",
        isSelected && "bg-white/10"
      )}
    >
      <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={participantName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-white">
            {participantName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold truncate">{participantName}</h3>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {formatTimestamp(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400 truncate">
            {conversation.last_message || "No messages yet"}
          </p>
          {conversation.unread_count > 0 && (
            <div className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
              {conversation.unread_count}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
