import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface MessageRequest {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  message: string;
  followers: number;
}

export const MessageRequestCard = ({ request }: { request: MessageRequest }) => {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-muted hover:bg-card/80 transition-colors">
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src={request.avatar} alt={request.name} />
          <AvatarFallback>{request.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h4 className="font-semibold">{request.name}</h4>
              <p className="text-sm text-muted-foreground">@{request.username}</p>
            </div>
            <p className="text-xs text-muted-foreground">{request.followers} followers</p>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{request.message}</p>
          <div className="flex gap-2">
            <Button size="sm" className="w-full gap-2">
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button size="sm" variant="outline" className="w-full gap-2">
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};