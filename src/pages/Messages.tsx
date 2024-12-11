import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageList } from "@/components/messages/MessageList";
import { MessageRequestCard } from "@/components/messages/MessageRequestCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useMessages, useMessageRequests } from "@/components/messages/useMessages";
import { useMessageActions } from "@/components/messages/useMessageActions";

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
        setCurrentUserId(user.id);
        const channel = supabase
          .channel('messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `recipient_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('New message received:', payload);
              toast({
                title: "New Message",
                description: "You have received a new message",
              });
              messagesQuery.refetch();
              requestsQuery.refetch();
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar setIsCreatingPost={() => {}} />
      <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8 md:ml-72 lg:mr-96">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>
          
          <Tabs defaultValue="inbox" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="inbox" className="flex-1">Inbox</TabsTrigger>
              <TabsTrigger value="requests" className="flex-1">
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
                <div>Loading messages...</div>
              ) : messagesQuery.error ? (
                <div>Error loading messages</div>
              ) : (
                <MessageList 
                  messages={messagesQuery.data?.map(msg => ({
                    id: msg.id,
                    username: msg.sender.username,
                    name: msg.sender.username,
                    avatar: msg.sender.avatar_url,
                    lastMessage: msg.content,
                    timestamp: new Date(msg.created_at).toLocaleTimeString(),
                    unread: !msg.read_at
                  })) || []}
                />
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="mt-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-4 pr-4">
                  {requestsQuery.isLoading ? (
                    <div>Loading requests...</div>
                  ) : requestsQuery.error ? (
                    <div>Error loading requests</div>
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
      </div>
    </div>
  );
};

export default Messages;