
import { useState, useEffect } from "react";
import { useEncryption } from "@/providers/EncryptionProvider";
import { useSecureConfig } from "@/hooks/useSecureConfig";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessagePanel } from "@/components/messages/MessagePanel";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { secureLog } from "@/utils/secureLogging";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { useTelegramMessages } from "@/components/messages/hooks/useTelegramMessages";

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const encryption = useEncryption();
  const session = useSession();
  const { messages, sendMessage, isLoading, error } = useTelegramMessages(selectedConversation);
  const { data: secureMessagingConfig } = useSecureConfig<{
    encryptionEnabled: boolean;
    messagingSetup: boolean;
  }>("secure_messaging", {
    encryptionEnabled: true,
    messagingSetup: false
  });

  // Reset unread message count when visiting this page
  const { resetUnreadCount } = useNotificationCount(session?.user?.id || null);

  useEffect(() => {
    if (session?.user?.id) {
      resetUnreadCount('messages');
    }
  }, [session?.user?.id, resetUnreadCount]);

  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        if (!encryption.isEncryptionInitialized) {
          secureLog("Encryption not initialized for messaging", { level: "warn" });
          return;
        }
        
        // Check if messaging is already set up
        if (secureMessagingConfig?.messagingSetup) {
          secureLog("Messaging already set up", { level: "info" });
          setIsInitialized(true);
          return;
        }
        
        secureLog("Initializing secure messaging", { level: "info" });
        setIsInitialized(true);
      } catch (error) {
        secureLog(error, { level: "error" });
        toast.error("Failed to initialize secure messaging");
      }
    };

    initializeMessaging();
  }, [encryption.isEncryptionInitialized, secureMessagingConfig]);

  if (!encryption.isEncryptionInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold mb-4">Security Setup Required</h2>
          <p className="mb-4">
            To access encrypted messages, you need to initialize your encryption
            security code first.
          </p>
          <p className="text-sm text-muted-foreground">
            Please go to Settings → Security and set up your encryption key.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div className="bg-black w-80 border-r border-white/10 h-full flex flex-col">
          <ConversationList 
            selectedConversationId={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        </div>
        <div className="flex-1 flex flex-col bg-black">
          <MessagePanel 
            conversationId={selectedConversation}
            messages={messages} 
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
