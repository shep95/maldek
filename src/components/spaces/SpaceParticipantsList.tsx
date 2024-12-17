import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MicOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SpaceParticipantControls } from "./SpaceParticipantControls";
import { useSession } from "@supabase/auth-helpers-react";

interface SpaceParticipantsListProps {
  participants: any[];
  spaceId: string;
  isHost: boolean;
  onParticipantUpdate: () => void;
}

export const SpaceParticipantsList = ({ 
  participants,
  spaceId,
  isHost,
  onParticipantUpdate
}: SpaceParticipantsListProps) => {
  const session = useSession();

  const handleMuteAll = async () => {
    try {
      const { data, error } = await supabase.rpc('mute_all_speakers', {
        space_id: spaceId,
        admin_user_id: session?.user?.id
      });

      if (error) throw error;
      if (data) {
        toast.success("All speakers have been muted");
        onParticipantUpdate();
      } else {
        toast.error("You don't have permission to mute all speakers");
      }
    } catch (error) {
      console.error('Error muting all speakers:', error);
      toast.error("Failed to mute all speakers");
    }
  };

  const currentUserRole = participants.find(
    p => p.user_id === session?.user?.id
  )?.role;

  const canManageParticipants = ['host', 'co_host'].includes(currentUserRole);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Participants</h3>
        {canManageParticipants && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMuteAll}
            className="flex items-center gap-1"
          >
            <MicOff className="h-4 w-4" />
            Mute All Speakers
          </Button>
        )}
      </div>

      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {participants.map((participant) => (
            <div key={participant.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
              
              {canManageParticipants && participant.user_id !== session?.user?.id && (
                <SpaceParticipantControls
                  spaceId={spaceId}
                  participant={participant}
                  currentUserId={session?.user?.id}
                  onParticipantMuted={onParticipantUpdate}
                />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};