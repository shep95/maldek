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
import { MessageCircle } from "lucide-react";

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
      <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
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
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!currentUserId) {
    return <LoadingState />;
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      
      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="w-full mb-6 p-1">
          <TabsTrigger value="inbox" className="flex-1 py-3">Inbox</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 py-3">
            Message Requests
            {requestsQuery.data && requestsQuery.data.length > 0 && (
              <span className="ml-2 bg-accent text-white px-2 py-0.5 rounded-full text-xs">
                {requestsQuery.data.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
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
          <ScrollArea className="h-[calc(100vh-16rem)]">
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
      </Tabs>
    </div>
  );
};

export default Messages;