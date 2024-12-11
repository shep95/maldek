import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageList } from "@/components/messages/MessageList";
import { MessageRequestCard } from "@/components/messages/MessageRequestCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
  content: string;
  created_at: string;
  read_at: string | null;
  status: string;
}

const Messages = () => {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Subscribe to real-time messages
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
              // React Query will automatically refresh the messages
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

  // Fetch messages
  const messagesQuery = useQuery({
    queryKey: ['messages', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          status,
          sender:sender_id(username, avatar_url, follower_count)
        `)
        .eq('recipient_id', currentUserId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return messages;
    },
    enabled: !!currentUserId,
  });

  // Fetch message requests
  const requestsQuery = useQuery({
    queryKey: ['message_requests', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data: requests, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          status,
          sender:sender_id(username, avatar_url, follower_count)
        `)
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return requests;
    },
    enabled: !!currentUserId,
  });

  const handleAcceptRequest = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'accepted' })
      .eq('id', messageId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept message request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message request accepted",
      });
      messagesQuery.refetch();
      requestsQuery.refetch();
    }
  };

  const handleDeclineRequest = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'rejected' })
      .eq('id', messageId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to decline message request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message request declined",
      });
      requestsQuery.refetch();
    }
  };

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
                          followers: request.sender.follower_count || 0
                        }}
                        onAccept={() => handleAcceptRequest(request.id)}
                        onDecline={() => handleDeclineRequest(request.id)}
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