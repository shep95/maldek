
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
import { useEncryption } from "@/providers/EncryptionProvider";
import { Conversation } from "./types/messageTypes";

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList = ({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();
  const encryption = useEncryption();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!session?.user?.id) return;
        
        setIsLoading(true);
        secureLog("Fetching conversations", { level: "info" });
        
        // Use a more generic approach with type assertion
        const { data, error } = await supabase
          .from("conversations" as any)
          .select("id, name, last_message, last_message_at, unread_count, encrypted_metadata, user_id, participant_id, is_group, created_at")
          .eq("user_id", session.user.id)
          .order("last_message_at", { ascending: false });

        if (error) throw error;

        // Process conversations and decrypt metadata if available
        const processedConversations = await Promise.all(
          (data || []).map(async (conv: any) => {
            try {
              if (conv.encrypted_metadata && encryption.isEncryptionInitialized) {
                const decryptedMetadata = await encryption.decryptText(conv.encrypted_metadata);
                if (decryptedMetadata) {
                  const metadata = JSON.parse(decryptedMetadata);
                  return { ...conv, metadata } as Conversation;
                }
              }
              return conv as Conversation;
            } catch (err) {
              secureLog(`Failed to decrypt conversation metadata: ${err}`, { level: "error" });
              return conv as Conversation;
            }
          })
        );

        setConversations(processedConversations);
      } catch (error) {
        secureLog(error, { level: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for new conversations
    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user_id=eq.${session?.user?.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, encryption.isEncryptionInitialized]);

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
