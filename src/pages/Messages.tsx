
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageList } from "@/components/messages/MessageList";
import { MessageRequestCard } from "@/components/messages/MessageRequestCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useMessages, useMessageRequests } from "@/components/messages/useMessages";
import { useMessageActions } from "@/components/messages/useMessageActions";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Inbox, UserPlus, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatInterface } from "@/components/messages/ChatInterface";

const Messages = () => {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const MAX_CHARS = 120;
  const { acceptRequest, declineRequest, sendMessage } = useMessageActions();
  const messagesQuery = useMessages(currentUserId);
  const requestsQuery = useMessageRequests(currentUserId);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Current user ID:', user.id);
        setCurrentUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartMessage = async (userId: string, username: string) => {
    if (!currentUserId) return;

    try {
      await sendMessage({
        recipientId: userId,
        content: previewMessage || `Hi ${username}! I'd like to connect with you.`,
      });
      
      toast({
        title: "Message request sent",
        description: "They'll be notified of your request.",
      });
      
      setSearchQuery("");
      setSearchResults([]);
      setPreviewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message request",
        variant: "destructive",
      });
    }
  };

  const EmptyState = ({ type }: { type: 'messages' | 'requests' }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full" />
        <MessageCircle className="relative h-16 w-16 text-accent mb-4 animate-pulse" />
      </div>
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
        {type === 'messages' ? "No messages yet" : "No message requests"}
      </h3>
      <p className="text-muted-foreground max-w-sm">
        {type === 'messages' 
          ? "When you receive messages, they'll appear here" 
          : "When you receive message requests, they'll appear here"}
      </p>
    </div>
  );

  const LoadingState = () => (
    <div className="space-y-4 animate-fade-in">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start space-x-4 p-4">
          <Skeleton className="h-12 w-12 rounded-full bg-accent/5" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4 bg-accent/5" />
            <Skeleton className="h-4 w-3/4 bg-accent/5" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!currentUserId) {
    return <LoadingState />;
  }

  if (selectedChat) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedChat(null)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent via-accent/80 to-accent/60 bg-clip-text text-transparent">
            Messages
          </h1>
        </div>
        <ChatInterface
          recipientId={selectedChat.id}
          recipientName={selectedChat.name}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl -z-10" />
      
      <div className="relative">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-accent via-accent/80 to-accent/60 bg-clip-text text-transparent">
          Messages
        </h1>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users to message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className="pl-10 bg-background/50 backdrop-blur-sm"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-2 w-full bg-background/95 backdrop-blur-md rounded-lg border border-border/50 shadow-lg animate-fade-in">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col p-4 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="relative">
                      <Input
                        placeholder={`Write a message to ${user.username}...`}
                        value={previewMessage}
                        onChange={(e) => {
                          if (e.target.value.length <= MAX_CHARS) {
                            setPreviewMessage(e.target.value);
                          }
                        }}
                        className="pr-16 bg-background/50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {previewMessage.length}/{MAX_CHARS}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartMessage(user.id, user.username)}
                        className="hover:bg-accent/10"
                      >
                        Send Request
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="w-full mb-6 p-1 bg-background/50 backdrop-blur-lg border border-accent/10 rounded-2xl">
            <TabsTrigger 
              value="inbox" 
              className="flex-1 py-3 space-x-2 data-[state=active]:bg-accent/10 data-[state=active]:text-accent transition-all duration-300"
            >
              <Inbox className="w-4 h-4" />
              <span>Inbox</span>
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="flex-1 py-3 space-x-2 data-[state=active]:bg-accent/10 data-[state=active]:text-accent transition-all duration-300"
            >
              <UserPlus className="w-4 h-4" />
              <span>Message Requests</span>
              {requestsQuery.data && requestsQuery.data.length > 0 && (
                <span className="ml-2 bg-accent text-white px-2 py-0.5 rounded-full text-xs animate-pulse">
                  {requestsQuery.data.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-background/40 backdrop-blur-xl rounded-3xl border border-accent/10 p-6">
            <TabsContent value="inbox" className="mt-0">
              {messagesQuery.isLoading ? (
                <LoadingState />
              ) : messagesQuery.error ? (
                <div className="text-center py-8 text-destructive">Error loading messages</div>
              ) : !messagesQuery.data?.length ? (
                <EmptyState type="messages" />
              ) : (
                <MessageList 
                  messages={messagesQuery.data?.map(msg => ({
                    id: msg.id,
                    username: msg.recipient?.username || msg.sender.username,
                    name: msg.recipient?.username || msg.sender.username,
                    avatar: msg.recipient?.avatar_url || msg.sender.avatar_url,
                    lastMessage: msg.content,
                    timestamp: msg.created_at,
                    unread: !msg.read_at
                  })) || []}
                  onSelectChat={setSelectedChat}
                />
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="mt-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-4 pr-4">
                  {requestsQuery.isLoading ? (
                    <LoadingState />
                  ) : requestsQuery.error ? (
                    <div className="text-center py-8 text-destructive">Error loading requests</div>
                  ) : !requestsQuery.data?.length ? (
                    <EmptyState type="requests" />
                  ) : (
                    requestsQuery.data?.map((request) => (
                      <MessageRequestCard
                        key={request.id}
                        request={{
                          id: request.id,
                          username: request.sender.username,
                          name: request.sender.username,
                          avatar: request.sender.avatar_url,
                          message: request.content,
                          followers: request.sender.follower_count
                        }}
                        onAccept={() => acceptRequest(request.id)}
                        onDecline={() => declineRequest(request.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Messages;
