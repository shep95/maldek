
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ChatHeaderProps {
  recipientName: string;
  recipientAvatar?: string | null;
  onViewProfile: () => void;
  isOnline: boolean;
}

export const ChatHeader = ({ recipientName, recipientAvatar, onViewProfile, isOnline }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 ring-2 ring-accent/10">
          <AvatarImage src={recipientAvatar || ''} alt={recipientName} />
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
    </div>
  );
};
