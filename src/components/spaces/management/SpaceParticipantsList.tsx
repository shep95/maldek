import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MicOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SpaceParticipantItem } from "./SpaceParticipantItem";
import { useEffect, useState } from "react";

interface SpaceParticipantsListProps {
  participants: any[];
  spaceId: string;
  canManageParticipants: boolean;
  currentUserId?: string;
  onParticipantUpdate: () => void;
}

export const SpaceParticipantsList = ({
  participants,
  spaceId,
  canManageParticipants,
  currentUserId,
  onParticipantUpdate
}: SpaceParticipantsListProps) => {
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Subscribe to real-time updates for speaking status and raised hands
    const channel = supabase.channel(`space:${spaceId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Update speaking participants
        const speaking = new Set<string>();
        const hands = new Set<string>();
        
        Object.values(state).forEach((presence: any) => {
          presence.forEach((p: any) => {
            if (p.isSpeaking) speaking.add(p.userId);
            if (p.hasRaisedHand) hands.add(p.userId);
          });
        });
        
        setSpeakingParticipants(speaking);
        setRaisedHands(hands);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const handleMuteAll = async () => {
    try {
      const { data, error } = await supabase.rpc('mute_all_speakers', {
        space_id: spaceId,
        admin_user_id: currentUserId
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
            <SpaceParticipantItem
              key={participant.user_id}
              participant={participant}
              spaceId={spaceId}
              currentUserId={currentUserId}
              canManageParticipants={canManageParticipants}
              onParticipantUpdate={onParticipantUpdate}
              isSpeaking={speakingParticipants.has(participant.user_id)}
              hasRaisedHand={raisedHands.has(participant.user_id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};