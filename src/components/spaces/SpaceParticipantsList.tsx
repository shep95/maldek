import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SpaceParticipantsListProps {
  participants: any[];
}

export const SpaceParticipantsList = ({ participants }: SpaceParticipantsListProps) => {
  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {participants.map((participant) => (
          <div key={participant.user_id} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={participant.profile?.avatar_url} />
              <AvatarFallback>
                {participant.profile?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {participant.profile?.username}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {participant.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};