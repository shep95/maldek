import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, Video } from "lucide-react";

export interface ChatHeaderProps {
  recipientName: string;
  onViewProfile: () => void;
  isOnline: boolean;
}

export const ChatHeader = ({ recipientName, onViewProfile, isOnline }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 ring-2 ring-accent/10">
            <AvatarImage src={`/avatars/${recipientName}.png`} alt={recipientName} />
            <AvatarFallback>{recipientName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold hover:text-accent transition-colors cursor-pointer" onClick={onViewProfile}>
              {recipientName}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-muted/50 transition-colors">
            <Phone className="h-4 w-4" />
            <span className="sr-only">Voice call</span>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted/50 transition-colors">
            <Video className="h-4 w-4" />
            <span className="sr-only">Video call</span>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted/50 transition-colors">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </div>
    </div>
  );
};