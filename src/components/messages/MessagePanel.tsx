
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useTelegramMessages } from "./hooks/useTelegramMessages";
import { useEncryptedMessageSend } from "./hooks/useEncryptedMessageSend";
import { MessageItem } from "./MessageItem";
import { useEncryption } from "@/providers/EncryptionProvider";
import { SecurityCodeDialog } from "@/components/settings/SecurityCodeDialog";

interface MessagePanelProps {
  userId: string | null;
  selectedConversation?: any;
}

export const MessagePanel = ({ userId, selectedConversation }: MessagePanelProps) => {
  const [message, setMessage] = useState("");
  const { isEncryptionInitialized } = useEncryption();
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const { data: messages = [], isLoading } = useTelegramMessages(userId);
  const { sendMessage, isProcessing } = useEncryptedMessageSend();

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    if (!isEncryptionInitialized) {
      setShowSecurityDialog(true);
      return;
    }

    sendMessage({
      recipientId: selectedConversation.id,
      content: message.trim(),
      telegramChatId: selectedConversation.telegram_id
    });
    
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedConversation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">
          {selectedConversation?.username || "Chat"}
          {!isEncryptionInitialized && " (Encryption not set up)"}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg: any) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              currentUserId={userId} 
              isEncrypted={!!msg.encrypted_content}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground p-4">
            No messages yet. Send a message to start the conversation.
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder={
              isEncryptionInitialized 
                ? "Type a message..." 
                : "Set up encryption before sending messages"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!isEncryptionInitialized || isProcessing}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!message.trim() || !isEncryptionInitialized || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SecurityCodeDialog 
        open={showSecurityDialog} 
        onOpenChange={setShowSecurityDialog} 
        mode="setup"
      />
    </div>
  );
};
