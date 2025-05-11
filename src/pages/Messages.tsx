import React, { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, MessagesSquare, Search, ArrowLeft, Settings, Clock, Inbox } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

const Messages: React.FC = () => {
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConversations, setShowConversations] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
  const {
    isEncryptionInitialized,
    initializeEncryption
  } = useEncryption();
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
        toast.error("Verification Failed", "Could not initialize encryption with the provided code");
        throw new Error("Could not initialize encryption with the provided code");
      } else {
        toast.success("Encryption Enabled", "You can now send and receive secure messages");
      }
    } catch (error) {
      console.error("Error initializing encryption:", error);
    }
  };

  // Find the current conversation recipient
  const selectedConversation = [...conversations, ...requestedConversations].find(conv => conv.id === selectedConversationId);
  const recipient = selectedConversation?.participants.find(p => p.id !== currentUserId);
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
      toast.success("Conversation Deleted", "The conversation has been removed");
    }
  };

  // Filter conversations based on search query
  const filteredConversations = searchQuery ? conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
  }) : conversations;
  const filteredRequestedConversations = searchQuery ? requestedConversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
  }) : requestedConversations;
  return <div className="h-full min-h-screen-dynamic p-2 sm:p-4 md:p-6 lg:p-8 mx-auto w-[calc(100%+500px)] max-w-screen-2xl px-4 sm:px-[25px] pb-16 sm:pb-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2">Messages</h1>
      
      {!isEncryptionInitialized && <Alert className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Encryption not enabled</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Enable end-to-end encryption to view and send secure messages.</span>
            <Button onClick={() => setIsSecurityDialogOpen(true)} size="sm" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Enter Security Code
            </Button>
          </AlertDescription>
        </Alert>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] pb-14 sm:pb-0">
        {/* Conversations sidebar - hide on mobile when viewing a conversation */}
        {(!isMobile || showConversations) && <div className="bg-card rounded-lg border shadow-md p-2 sm:p-4 pl-2 sm:pl-[250px] flex flex-col md:h-[calc(100vh-220px)] lg:h-[calc(100vh-240px)] md:w-full">
            {/* Conversations header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <MessagesSquare className="h-4 w-4" />
                Chats
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsDialogOpen(true)} className="text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search input */}
            <div className="relative mb-3 sm:mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            
            {/* Tabs for All and Requests - more touch-friendly on mobile */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={value => setActiveTab(value as "all" | "requests")} className="w-full">
              {/* Tabs content */}
              <TabsList className="grid grid-cols-2 mb-4 h-12 sm:h-10">
                <TabsTrigger value="all" className="flex items-center gap-1 text-base sm:text-sm">
                  <Inbox className="h-4 w-4" />
                  <span>All</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-1 text-base sm:text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Requests</span>
                  {requestedConversations.length > 0 && <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {requestedConversations.length}
                    </span>}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="flex-grow overflow-hidden m-0">
                <ConversationList conversations={filteredConversations} selectedConversationId={selectedConversationId || undefined} onSelectConversation={handleSelectConversation} />
              </TabsContent>
              
              <TabsContent value="requests" className="flex-grow overflow-hidden m-0">
                <ConversationList conversations={filteredRequestedConversations} selectedConversationId={selectedConversationId || undefined} onSelectConversation={handleSelectConversation} isRequestTab />
              </TabsContent>
            </Tabs>
          </div>}
        
        {/* Message thread - full width on mobile, 2/3 on larger screens */}
        {(!isMobile || !showConversations) && <div className="md:col-span-2 bg-card rounded-lg border shadow-md flex flex-col md:h-[calc(100vh-220px)] lg:h-[calc(100vh-240px)]">
            {selectedConversationId && recipient && currentUserId ? <MessageThread messages={messages} currentUserId={currentUserId} recipient={recipient} onSendMessage={handleSendMessage} onBackClick={isMobile ? handleBackToList : undefined} onDeleteConversation={handleDeleteMessages} /> : <div className="flex flex-col h-full">
                {isMobile && !showConversations && <div className="border-b py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={handleBackToList} className="mr-2">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold">Back to messages</span>
                  </div>}
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-center p-6">
                    <MessagesSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">
                      Select a conversation to view messages
                    </p>
                  </div>
                </div>
              </div>}
          </div>}
      </div>

      <SecurityCodeDialog isOpen={isSecurityDialogOpen} onOpenChange={setIsSecurityDialogOpen} action="verify" onSuccess={handleSecurityCodeVerified} />

      <MessageSettingsDialog isOpen={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen} />
    </div>;
};
export default Messages;
