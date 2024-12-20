import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SpaceRole, SpaceParticipant } from "@/types/spaces";

interface ParticipantManagementPanelProps {
  spaceId: string;
  currentUserId?: string;
  isHost: boolean;
}

export const ParticipantManagementPanel = ({
  spaceId,
  currentUserId,
  isHost
}: ParticipantManagementPanelProps) => {
  const [participants, setParticipants] = useState<SpaceParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('space_participants')
      .select(`
        *,
        profile:profiles(username, avatar_url)
      `)
      .eq('space_id', spaceId)
      .order('role', { ascending: false });

    if (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
      return;
    }

    setParticipants(data || []);
  };

  useEffect(() => {
    fetchParticipants();

    // Subscribe to participant changes
    const channel = supabase
      .channel(`space_participants:${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_participants',
          filter: `space_id=eq.${spaceId}`
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const handleRoleChange = async (userId: string, newRole: SpaceRole) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('space_participants')
        .update({ role: newRole })
        .eq('space_id', spaceId)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success(`Participant role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating participant role:', error);
      toast.error('Failed to update participant role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollArea className="h-[300px] w-full p-4">
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
                <span className="text-sm font-medium flex items-center gap-1">
                  {participant.profile?.username}
                  {participant.role === 'host' && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                  {participant.role === 'co_host' && (
                    <Crown className="h-3 w-3 text-blue-500" />
                  )}
                  {participant.role === 'speaker' && (
                    <Mic className="h-3 w-3 text-green-500" />
                  )}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {participant.role}
                </span>
              </div>
            </div>
            {isHost && participant.user_id !== currentUserId && (
              <div className="flex gap-2">
                {participant.role === 'speaker' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRoleChange(participant.user_id, 'listener')}
                    disabled={isLoading}
                  >
                    <MicOff className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRoleChange(participant.user_id, 'speaker')}
                    disabled={isLoading}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};