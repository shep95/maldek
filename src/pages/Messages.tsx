import React, { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, MessagesSquare, Search, ArrowLeft, Settings, Clock, Inbox, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { useEncryption } from "@/providers/EncryptionProvider";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSettingsDialog } from "@/components/messages/MessageSettingsDialog";
import { NewMessageDialog } from "@/components/messages/NewMessageDialog";
import { toast } from "@/components/ui/use-toast";
import { useRealtimeMessages } from "@/components/messages/hooks/useRealtimeMessages";
import { useMessageActions } from "@/components/messages/useMessageActions";
import { SecurityCodeDialog } from "@/components/settings/SecurityCodeDialog";

const Messages: React.FC = () => {
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
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
  
  // Use our real-time messages hook
  const {
    conversations,
    requestedConversations,
    messages,
    selectedConversationId,
    setSelectedConversationId,
    refreshConversations,
    removeMessage
  } = useRealtimeMessages();
  
  // Use message actions
  const {
    sendMessage,
    deleteMessage,
    deleteConversation,
    startConversation,
    acceptMessageRequest
  } = useMessageActions();
  
  const handleSecurityCodeVerified = async (securityCode: string) => {
    try {
      const success = await initializeEncryption(securityCode);
      if (!success) {
        toast.error("Could not initialize encryption with the provided code");
      } else {
        toast.success("Encryption initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing encryption:", error);
      toast.error("Error initializing encryption");
    }
  };

  // Find the current conversation recipient
  const selectedConversation = [...conversations, ...requestedConversations].find(conv => conv.id === selectedConversationId);
  const recipient = selectedConversation?.participants.find(p => p.id !== currentUserId);
  
  const handleSendMessage = (content: string, mediaFile?: File) => {
    if (recipient) {
      // Check if this conversation is in the main conversations list (not a request)
      const isInMainConversations = conversations.some(c => c.id === selectedConversationId);
      
      sendMessage({
        recipientId: recipient.id,
        content,
        conversationId: selectedConversationId || undefined,
        isEncrypted: false, // Default to non-encrypted messages
        isFollowing: isInMainConversations, // If in main conversations, we treat as following
        mediaFile
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
    // Immediately remove the message from UI
    removeMessage(messageId);
  };
  
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    if (isMobile) {
      setShowConversations(false);
    }
  };

  const handleAcceptRequest = (id: string) => {
    acceptMessageRequest(id);
    setSelectedConversationId(id);
    setActiveTab("all");
    if (isMobile) {
      setShowConversations(false);
    }
    toast.success("Message request accepted");
  };
  
  const handleBackToList = () => {
    setShowConversations(true);
  };
  
  const handleDeleteConversation = () => {
    if (selectedConversationId) {
      deleteConversation(selectedConversationId);
      setSelectedConversationId(null);
      if (isMobile) {
        setShowConversations(true);
      }
    }
  };

  const handleSelectUser = (userId: string, username: string, isFollowing: boolean) => {
    if (userId) {
      startConversation({
        recipientId: userId,
        isRequest: !isFollowing
      });
      
      if (isMobile) {
        setShowConversations(false);
      }
      
      toast.success(
        isFollowing 
          ? `Started conversation with ${username}` 
          : `Sent message request to ${username}`
      );
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
  
  return (
    <div className="min-h-screen w-full p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Messages</h1>
        
        {!isEncryptionInitialized && (
          <Alert className="mb-4 md:mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Encryption not enabled</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>Enable end-to-end encryption to view and send secure messages.</span>
              <Button onClick={() => setIsSecurityDialogOpen(true)} size="sm" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Enter Security Code
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-[calc(100vh-200px)]">
          {/* Conversations sidebar - responsive width */}
          {(!isMobile || showConversations) && (
            <div className="lg:col-span-1 bg-card rounded-lg border shadow-md p-4 flex flex-col h-full">
              {/* Conversations header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="font-semibold flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4" />
                  Chats
                </h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsNewMessageDialogOpen(true)} 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSettingsDialogOpen(true)} 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Search input */}
              <div className="relative mb-4 flex-shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-9" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>
              
              {/* Tabs for All and Requests */}
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={value => setActiveTab(value as "all" | "requests")} 
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList className="grid grid-cols-2 mb-4 flex-shrink-0">
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    <Inbox className="h-4 w-4" />
                    <span>All</span>
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Requests</span>
                    {requestedConversations.length > 0 && (
                      <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {requestedConversations.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 min-h-0">
                  <TabsContent value="all" className="h-full m-0">
                    <ConversationList 
                      conversations={filteredConversations} 
                      selectedConversationId={selectedConversationId || undefined}
                      onSelectConversation={handleSelectConversation} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="requests" className="h-full m-0">
                    <ConversationList 
                      conversations={filteredRequestedConversations}
                      selectedConversationId={selectedConversationId || undefined}
                      onSelectConversation={handleSelectConversation}
                      onAcceptRequest={handleAcceptRequest}
                      isRequestTab 
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
          
          {/* Message thread - responsive width */}
          {(!isMobile || !showConversations) && (
            <div className="lg:col-span-2 bg-card rounded-lg border shadow-md flex flex-col h-full">
              {selectedConversationId && recipient && currentUserId ? (
                <MessageThread 
                  messages={messages}
                  currentUserId={currentUserId} 
                  recipient={recipient}
                  onSendMessage={handleSendMessage}
                  onBackClick={isMobile ? handleBackToList : undefined}
                  onDeleteConversation={handleDeleteConversation} 
                  onDeleteMessage={handleDeleteMessage}
                />
              ) : (
                <div className="flex flex-col h-full">
                  {isMobile && !showConversations && (
                    <div className="border-b py-3 px-4 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={handleBackToList} className="mr-2">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold">Back to messages</span>
                    </div>
                  )}
                  <div className="flex-1 flex items-center justify-center">
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
          )}
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

        <NewMessageDialog 
          isOpen={isNewMessageDialogOpen}
          onOpenChange={setIsNewMessageDialogOpen}
          onSelectUser={handleSelectUser}
        />
      </div>
    </div>
  );
};

export default Messages;
