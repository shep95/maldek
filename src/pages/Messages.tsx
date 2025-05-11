
import React, { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, MessagesSquare, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { useMessages } from "@/components/messages/hooks/useMessages";
import { SecurityCodeDialog } from "@/components/settings/SecurityCodeDialog";
import { useEncryption } from "@/providers/EncryptionProvider";
import { Input } from "@/components/ui/input";

const Messages: React.FC = () => {
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isEncryptionInitialized, initializeEncryption } = useEncryption();
  const session = useSession();
  const currentUserId = session?.user?.id;
  
  const {
    conversations,
    messages,
    users,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage
  } = useMessages();

  const handleSecurityCodeVerified = async (securityCode: string) => {
    try {
      const success = await initializeEncryption(securityCode);
      if (!success) {
        throw new Error("Could not initialize encryption with the provided code");
      }
    } catch (error) {
      console.error("Error initializing encryption:", error);
    }
  };

  // Find the current conversation recipient
  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );
  
  const recipient = selectedConversation?.participants.find(
    (p) => p.id !== currentUserId
  );

  const handleSendMessage = (content: string) => {
    if (recipient) {
      sendMessage({
        recipientId: recipient.id,
        content,
        isEncrypted: false // Default to non-encrypted messages
      });
    }
  };

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? conversations.filter(conv => {
        const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
        return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  return (
    <div className="h-full min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      {!isEncryptionInitialized && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Encryption not enabled</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Enable end-to-end encryption to view and send secure messages.</span>
            <Button 
              onClick={() => setIsSecurityDialogOpen(true)}
              size="sm"
              variant="outline"
              className="ml-2"
            >
              <Shield className="h-4 w-4 mr-2" />
              Enter Security Code
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        <div className="bg-card rounded-lg border shadow-md p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MessagesSquare className="h-4 w-4" />
              Chats
            </h2>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex-grow overflow-hidden">
            <ConversationList 
              conversations={filteredConversations}
              selectedConversationId={selectedConversationId || undefined}
              onSelectConversation={(id) => setSelectedConversationId(id)}
            />
          </div>
        </div>
        
        <div className="md:col-span-2 bg-card rounded-lg border shadow-md">
          {selectedConversationId && recipient && currentUserId ? (
            <MessageThread
              messages={messages}
              currentUserId={currentUserId}
              recipient={recipient}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="border-b py-4 px-4">
                <h2 className="font-semibold">Messages</h2>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <div className="text-center p-6">
                  <MessagesSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">
                    Select a conversation to view messages
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SecurityCodeDialog
        isOpen={isSecurityDialogOpen}
        onOpenChange={setIsSecurityDialogOpen}
        action="verify"
        onSuccess={handleSecurityCodeVerified}
      />
    </div>
  );
};

export default Messages;
