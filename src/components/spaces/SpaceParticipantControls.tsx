import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SpaceParticipantControlsProps {
  spaceId: string;
  participant: any;
  currentUserId: string;
  onParticipantMuted: () => void;
}

export const SpaceParticipantControls = ({
  spaceId,
  participant,
  currentUserId,
  onParticipantMuted
}: SpaceParticipantControlsProps) => {
  const handleMuteParticipant = async () => {
    try {
      const { data, error } = await supabase.rpc('mute_participant', {
        space_id: spaceId,
        target_user_id: participant.user_id,
        admin_user_id: currentUserId
      });

      if (error) throw error;
      if (data) {
        toast.success(`Muted ${participant.profile?.username}`);
        onParticipantMuted();
      } else {
        toast.error("You don't have permission to mute participants");
      }
    } catch (error) {
      console.error('Error muting participant:', error);
      toast.error("Failed to mute participant");
    }
  };

  return (
    <div className="flex gap-2">
      {participant.role === 'speaker' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMuteParticipant}
          className="flex items-center gap-1"
        >
          <MicOff className="h-4 w-4" />
          Mute
        </Button>
      )}
    </div>
  );
};