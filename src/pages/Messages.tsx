import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageList } from "@/components/messages/MessageList";
import { MessageRequestCard } from "@/components/messages/MessageRequestCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/dashboard/Sidebar";

// Mock data - In a real app, this would come from your backend
const mockMessages = [
  {
    id: "1",
    username: "sarah_dev",
    name: "Sarah Wilson",
    lastMessage: "The new design looks great! When can we...",
    timestamp: "2m",
    unread: true,
  },
  {
    id: "2",
    username: "alex_tech",
    name: "Alex Johnson",
    lastMessage: "I've pushed the changes to the repo...",
    timestamp: "1h",
  },
  // Add more mock messages as needed
];

const mockRequests = [
  {
    id: "1",
    username: "mike_design",
    name: "Mike Brown",
    message: "Hey! I'd love to connect and discuss the latest design trends!",
    followers: 234,
  },
  {
    id: "2",
    username: "emma_code",
    name: "Emma Davis",
    message: "Hi there! I saw your recent post about React hooks...",
    followers: 456,
  },
  // Add more mock requests as needed
];

const Messages = () => {
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
                {mockRequests.length > 0 && (
                  <span className="ml-2 bg-accent text-white px-2 py-0.5 rounded-full text-xs">
                    {mockRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="inbox" className="mt-0">
              <MessageList messages={mockMessages} />
            </TabsContent>
            
            <TabsContent value="requests" className="mt-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-4 pr-4">
                  {mockRequests.map((request) => (
                    <MessageRequestCard key={request.id} request={request} />
                  ))}
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