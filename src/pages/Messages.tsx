
import React, { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, MessagesSquare, Search, ArrowLeft, Settings, Clock, Inbox, ChevronDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { useMessages } from "@/components/messages/hooks/useMessages";
import { SecurityCodeDialog } from "@/components/settings/SecurityCodeDialog";
import { useEncryption } from "@/providers/EncryptionProvider";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSettingsDialog } from "@/components/messages/MessageSettingsDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Messages: React.FC = () => {
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConversations, setShowConversations] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
  const [isOpen, setIsOpen] = useState(true);
  const { isEncryptionInitialized, initializeEncryption } = useEncryption();
  const session = useSession();
  const currentUserId = session?.user?.id;
  const isMobile = useIsMobile();
  
  const {
    conversations,
    requestedConversations,
    messages,
    users,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    deleteConversation
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
  const selectedConversation = [...conversations, ...requestedConversations].find(
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

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    if (isMobile) {
      setShowConversations(false);
    }
  };

  const handleBackToList = () => {
    setShowConversations(true);
  };

  const handleDeleteMessages = () => {
    if (selectedConversationId) {
      deleteConversation(selectedConversationId);
      setSelectedConversationId(null);
      if (isMobile) {
        setShowConversations(true);
      }
    }
  };

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? conversations.filter(conv => {
        const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
        return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  const filteredRequestedConversations = searchQuery
    ? requestedConversations.filter(conv => {
        const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
        return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : requestedConversations;

  return (
    <div className="h-full min-h-screen-dynamic p-2 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2">Messages</h1>
      
      {!isEncryptionInitialized && (
        <Alert className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Encryption not enabled</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Enable end-to-end encryption to view and send secure messages.</span>
            <Button 
              onClick={() => setIsSecurityDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              Enter Security Code
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 md:gap-4 lg:gap-6 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
        {/* Conversations dropdown */}
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="bg-card rounded-lg border shadow-md w-full"
        >
          <div className="p-2 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4" />
              <h2 className="font-semibold">Chats</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSettingsDialogOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "" : "transform rotate-180"}`} />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          
          <CollapsibleContent>
            <div className="px-2 sm:px-4 pb-3">
              <div className="relative mb-3 sm:mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as "all" | "requests")}
                className="w-full"
              >
                <TabsList className="flex flex-col space-y-1 mb-4">
                  <TabsTrigger value="all" className="flex items-center justify-start gap-1 w-full">
                    <Inbox className="h-4 w-4" />
                    <span>All</span>
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex items-center justify-start gap-1 w-full">
                    <Clock className="h-4 w-4" />
                    <span>Requests</span>
                    {requestedConversations.length > 0 && (
                      <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {requestedConversations.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="max-h-[400px] overflow-auto m-0">
                  <ConversationList 
                    conversations={filteredConversations}
                    selectedConversationId={selectedConversationId || undefined}
                    onSelectConversation={handleSelectConversation}
                    showPreview={false}
                  />
                </TabsContent>
                
                <TabsContent value="requests" className="max-h-[400px] overflow-auto m-0">
                  <ConversationList 
                    conversations={filteredRequestedConversations}
                    selectedConversationId={selectedConversationId || undefined}
                    onSelectConversation={handleSelectConversation}
                    isRequestTab
                    showPreview={false}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* Message thread */}
        <div className="bg-card rounded-lg border shadow-md flex flex-col flex-grow">
          {selectedConversationId && recipient && currentUserId ? (
            <MessageThread
              messages={messages}
              currentUserId={currentUserId}
              recipient={recipient}
              onSendMessage={handleSendMessage}
              onBackClick={isMobile ? handleBackToList : undefined}
              onDeleteConversation={handleDeleteMessages}
            />
          ) : (
            <div className="flex flex-col h-full">
              {isMobile && !showConversations && (
                <div className="border-b py-3 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold">Back to messages</span>
                </div>
              )}
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

      <MessageSettingsDialog 
        isOpen={isSettingsDialogOpen} 
        onOpenChange={setIsSettingsDialogOpen} 
      />
    </div>
  );
};

export default Messages;
