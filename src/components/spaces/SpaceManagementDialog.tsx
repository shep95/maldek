import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, UserPlus, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useSpaceRTC } from "@/hooks/useSpaceRTC";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SpaceManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  isHost: boolean;
}

export const SpaceManagementDialog = ({
  isOpen,
  onOpenChange,
  spaceId,
  isHost
}: SpaceManagementDialogProps) => {
  const session = useSession();
  const [activeTab, setActiveTab] = useState("participants");
  const [speakerRequests, setSpeakerRequests] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const { isMuted, toggleMute, error } = useSpaceRTC(spaceId);

  useEffect(() => {
    if (!isOpen || !spaceId) return;

    // Fetch participants
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('space_participants')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('space_id', spaceId);

      if (error) {
        console.error('Error fetching participants:', error);
        return;
      }
      setParticipants(data);
    };

    // Fetch speaker requests
    const fetchSpeakerRequests = async () => {
      const { data, error } = await supabase
        .from('space_speaker_requests')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('space_id', spaceId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching speaker requests:', error);
        return;
      }
      setSpeakerRequests(data);
    };

    fetchParticipants();
    if (isHost) {
      fetchSpeakerRequests();
    }

    // Subscribe to real-time updates
    const channel = supabase.channel('space-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_participants',
          filter: `space_id=eq.${spaceId}`
        },
        () => fetchParticipants()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_speaker_requests',
          filter: `space_id=eq.${spaceId}`
        },
        () => fetchSpeakerRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId, isOpen, isHost]);

  const handleRequestToSpeak = async () => {
    try {
      const { error } = await supabase
        .from('space_speaker_requests')
        .insert({
          space_id: spaceId,
          user_id: session?.user?.id,
          status: 'pending'
        });

      if (error) throw error;
      toast.success("Request to speak sent!");
    } catch (error) {
      console.error('Error requesting to speak:', error);
      toast.error("Failed to send request");
    }
  };

  const handleSpeakerRequest = async (requestId: string, userId: string, accept: boolean) => {
    try {
      if (accept) {
        const { error: updateError } = await supabase
          .from('space_participants')
          .update({ role: 'speaker' })
          .eq('space_id', spaceId)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      const { error } = await supabase
        .from('space_speaker_requests')
        .update({
          status: accept ? 'accepted' : 'rejected',
          resolved_at: new Date().toISOString(),
          resolved_by: session?.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(accept ? "Speaker request accepted" : "Speaker request rejected");
    } catch (error) {
      console.error('Error handling speaker request:', error);
      toast.error("Failed to handle request");
    }
  };

  const handleEndSpace = async () => {
    try {
      const { error } = await supabase
        .from('spaces')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', spaceId);

      if (error) throw error;
      toast.success("Space ended successfully");
      onOpenChange(false);
    } catch (error) {
      console.error('Error ending space:', error);
      toast.error("Failed to end space");
    }
  };

  if (error) {
    toast.error(`Audio error: ${error}`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Controls</h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleMute()}
                  className={isMuted ? "bg-destructive/10" : "bg-green-500/10"}
                >
                  {isMuted ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {!isHost && (
                <Button 
                  onClick={handleRequestToSpeak}
                  className="w-full"
                  variant="secondary"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Request to Speak
                </Button>
              )}

              {isHost && (
                <Button 
                  onClick={handleEndSpace}
                  className="w-full"
                  variant="destructive"
                >
                  End Space
                </Button>
              )}

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
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            {isHost ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Speaker Requests</h3>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {speakerRequests.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No pending requests
                      </p>
                    ) : (
                      speakerRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.profile?.avatar_url} />
                              <AvatarFallback>
                                {request.profile?.username?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {request.profile?.username}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSpeakerRequest(request.id, request.user_id, false)}
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSpeakerRequest(request.id, request.user_id, true)}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Only hosts can view speaker requests
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};