import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

export const MessageList = ({ messages }: { messages: Message[] }) => {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-2 pr-4">
        {messages.map((message) => (
          <Button
            key={message.id}
            variant="ghost"
            className={`w-full justify-start p-3 h-auto ${
              message.unread ? "bg-accent/5" : ""
            }`}
          >
            <div className="flex gap-3 items-start w-full">
              <Avatar>
                <AvatarImage src={message.avatar} alt={message.name} />
                <AvatarFallback>{message.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold">{message.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {message.lastMessage}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};