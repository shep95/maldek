
import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "./ConversationItem";
import { NewConversationDialog } from "./NewConversationDialog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { secureLog } from "@/utils/secureLogging";

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList = ({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        secureLog("Fetching conversations", { level: "info" });
        
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching conversations:", error);
          throw error;
        }

        // Group messages by conversation
        const conversationsMap = new Map();
        
        (data || []).forEach(message => {
          const isUserSender = message.sender_id === session.user?.id;
          const otherUserId = isUserSender ? message.recipient_id : message.sender_id;
          
          const conversationId = `${session.user?.id}-${otherUserId}`;
          
          if (!conversationsMap.has(conversationId)) {
            conversationsMap.set(conversationId, {
              id: conversationId,
              name: isUserSender ? message.recipient_id : message.sender_id,
              last_message: message.content,
              last_message_at: message.created_at,
              unread_count: !isUserSender && !message.read_at ? 1 : 0,
              participant_id: otherUserId,
              user_id: session.user?.id
            });
          } else if (!isUserSender && !message.read_at) {
            // Update unread count for existing conversation
            const existing = conversationsMap.get(conversationId);
            conversationsMap.set(conversationId, {
              ...existing,
              unread_count: existing.unread_count + 1
            });
          }
        });

        setConversations(Array.from(conversationsMap.values()));
      } catch (error) {
        console.error("Error in fetchConversations:", error);
        secureLog(error, { level: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${session?.user?.id},sender_id=eq.${session?.user?.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateConversation = () => {
    setIsNewConversationOpen(true);
  };

  return (
    <>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold flex-1">Messages</h2>
          <Button
            onClick={handleCreateConversation}
            size="icon"
            variant="ghost"
            className="text-accent hover:text-accent hover:bg-accent/10"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8 bg-black/40 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 w-full bg-white/5 rounded-md"></div>
                ))}
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        onSelectConversation={onSelectConversation}
      />
    </>
  );
};
