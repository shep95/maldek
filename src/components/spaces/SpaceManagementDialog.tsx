import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useAgoraRTC } from "@/hooks/spaces/useAgoraRTC";
import { SpaceManagementControls } from "./SpaceManagementControls";
import { SpaceParticipantsList } from "./SpaceParticipantsList";
import { SpaceSpeakerRequests } from "./SpaceSpeakerRequests";

interface SpaceManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  isHost: boolean;
  onLeave: () => void;
}

export const SpaceManagementDialog = ({
  isOpen,
  onOpenChange,
  spaceId,
  isHost,
  onLeave
}: SpaceManagementDialogProps) => {
  const session = useSession();
  const [activeTab, setActiveTab] = useState("participants");
  const [speakerRequests, setSpeakerRequests] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("listener");
  
  const {
    isConnected,
    isMuted,
    error,
    joinChannel,
    leaveChannel,
    toggleMute
  } = useAgoraRTC(spaceId);

  const fetchData = async () => {
    try {
      const [participantsData, requestsData, userRoleData] = await Promise.all([
        supabase
          .from('space_participants')
          .select('*, profile:profiles(*)')
          .eq('space_id', spaceId),
        isHost ? supabase
          .from('space_speaker_requests')
          .select('*, profile:profiles(*)')
          .eq('space_id', spaceId)
          .eq('status', 'pending') : null,
        supabase
          .from('space_participants')
          .select('role')
          .eq('space_id', spaceId)
          .eq('user_id', session?.user?.id)
          .single()
      ]);

      if (participantsData.error) throw participantsData.error;
      setParticipants(participantsData.data || []);
      
      if (requestsData && !requestsData.error) {
        setSpeakerRequests(requestsData.data || []);
      }

      if (userRoleData.data) {
        setUserRole(userRoleData.data.role);
      }
    } catch (error) {
      console.error('Error fetching space data:', error);
      toast.error("Failed to load space data");
    }
  };

  useEffect(() => {
    if (!isOpen || !spaceId || !session?.user?.id) return;

    fetchData();
    joinChannel(session.user.id);

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
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_speaker_requests',
          filter: `space_id=eq.${spaceId}`
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      leaveChannel();
    };
  }, [spaceId, isOpen, session?.user?.id]);

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
      onLeave();
    } catch (error) {
      console.error('Error ending space:', error);
      toast.error("Failed to end space");
    }
  };

  if (error) {
    toast.error(`Audio error: ${error}`);
  }

  const isSpeaker = userRole === 'speaker' || userRole === 'host' || userRole === 'co_host';

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
            <SpaceManagementControls
              isMuted={isMuted}
              isHost={isHost}
              isSpeaker={isSpeaker}
              toggleMute={toggleMute}
              onRequestSpeak={handleRequestToSpeak}
              onLeave={onLeave}
              onEndSpace={handleEndSpace}
            />
            <SpaceParticipantsList 
              participants={participants}
              spaceId={spaceId}
              isHost={isHost}
              onParticipantUpdate={fetchData}
            />
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <SpaceSpeakerRequests
              isHost={isHost}
              speakerRequests={speakerRequests}
              onHandleRequest={handleSpeakerRequest}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};