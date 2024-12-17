import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface SpaceHistoryCardProps {
  space: any;
  onPurchaseRecording: (spaceId: string) => void;
  currentUserId: string | undefined;
}

export const SpaceHistoryCard = ({ space, onPurchaseRecording, currentUserId }: SpaceHistoryCardProps) => {
  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

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
            <p className="text-sm text-muted-foreground mt-1">
              Ended {formatDate(space.ended_at)}
            </p>
          </div>
          {space.recording_url && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onPurchaseRecording(space.id)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Purchase Recording ($2.00)
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
            <span className="text-sm font-medium">
              {space.host?.username}
            </span>
            <span className="text-xs text-muted-foreground">Host</span>
          </div>
        </div>

        {space.participants && space.participants.length > 0 && (
          <ScrollArea className="h-20">
            <div className="flex flex-wrap gap-2">
              {space.participants
                .filter((p: any) => p.user_id !== space.host_id)
                .map((participant: any) => (
                  <div key={participant.user_id} className="flex items-center gap-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participant.profile?.avatar_url} />
                      <AvatarFallback>
                        {participant.profile?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground capitalize">
                      {participant.role}
                    </span>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{space.participants?.length || 0} participants</span>
        </div>
      </div>
    </div>
  );
};