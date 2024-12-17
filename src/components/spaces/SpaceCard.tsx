import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Mic, Crown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SpaceCardProps {
  space: any;
  onJoin: (spaceId: string) => void;
  onLeave: (spaceId: string) => void;
  currentUserId?: string;
}

export const SpaceCard = ({ space, onJoin, onLeave, currentUserId }: SpaceCardProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'co_host':
        return <Crown className="h-3 w-3 text-blue-500" />;
      case 'speaker':
        return <Mic className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const isParticipant = space.participants?.some(
    (p: any) => p.user_id === currentUserId
  );

  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{space.title}</h3>
            {space.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {space.description}
              </p>
            )}
          </div>
          {isParticipant ? (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onLeave(space.id)}
            >
              Leave
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onJoin(space.id)}
            >
              Join
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={space.host?.avatar_url} />
            <AvatarFallback>
              {space.host?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium flex items-center gap-1">
              {space.host?.username}
              <Crown className="h-3 w-3 text-yellow-500" />
            </span>
            <span className="text-xs text-muted-foreground">Host</span>
          </div>
        </div>

        {space.participants && space.participants.length > 0 && (
          <ScrollArea className="h-20">
            <div className="flex flex-wrap gap-2">
              {space.participants.map((participant: any) => (
                <div key={participant.user_id} className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.profile?.avatar_url} />
                    <AvatarFallback>
                      {participant.profile?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {getRoleIcon(participant.role)}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{space.participants_count || 0} participants</span>
        </div>
      </div>
    </div>
  );
};