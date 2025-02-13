
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
import { MessageCircle, Inbox, UserPlus } from "lucide-react";

const Messages = () => {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { acceptRequest, declineRequest } = useMessageActions();
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

  return (
    <div className="animate-fade-in relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl -z-10" />
      
      <div className="relative">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-accent via-accent/80 to-accent/60 bg-clip-text text-transparent">
          Messages
        </h1>
        
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
                    username: msg.sender.username,
                    name: msg.sender.username,
                    avatar: msg.sender.avatar_url,
                    lastMessage: msg.content,
                    timestamp: msg.created_at,
                    unread: !msg.read_at
                  })) || []}
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
