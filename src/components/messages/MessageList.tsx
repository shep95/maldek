import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

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
            className={`w-full justify-start p-4 h-auto hover:bg-accent/5 transition-colors ${
              message.unread ? "bg-accent/5" : ""
            }`}
          >
            <div className="flex gap-4 items-start w-full">
              <Avatar className="h-12 w-12 border-2 border-accent/10">
                <AvatarImage src={message.avatar} alt={message.name} />
                <AvatarFallback className="bg-accent/10 text-accent">
                  {message.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-semibold text-base">
                    {message.name}
                    {message.unread && (
                      <span className="ml-2 inline-block w-2 h-2 bg-accent rounded-full" />
                    )}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
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