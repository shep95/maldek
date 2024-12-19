import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useAgoraRTC } from "@/hooks/spaces/useAgoraRTC";
import { SpaceManagementControls } from "./SpaceManagementControls";
import { SpaceParticipantsList } from "./SpaceParticipantsList";
import { SpaceSpeakerRequests } from "../SpaceSpeakerRequests";
import { RecordingStatus } from "../recording/RecordingStatus";
import { useState as useRecordingState } from "react";
import { SpaceCategories, SpaceCategory } from "../features/SpaceCategories";
import { SpaceChat } from "../features/SpaceChat";
import { SpaceReactions } from "../features/SpaceReactions";
import { SpaceAudioIndicator } from "../features/SpaceAudioIndicator";

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
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [recordingDuration, setRecordingDuration] = useRecordingState(0);
  const [isRecording, setIsRecording] = useRecordingState(false);
  
  const {
    isConnected,
    isMuted,
    error,
    joinChannel,
    leaveChannel,
    toggleMute
  } = useAgoraRTC(spaceId);

  useEffect(() => {
    if (!isOpen || !spaceId || !session?.user?.id) return;

    // Join Agora channel
    joinChannel(session.user.id);

    // Track user presence in the space
    const presenceChannel = supabase.channel(`space:${spaceId}`)
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence state synchronized:', presenceChannel.presenceState());
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
        fetchParticipants(); // Refresh participants list
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
        fetchParticipants(); // Refresh participants list
      });

    // Track user's state
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          user_id: session.user.id,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Subscribe to real-time updates for participants
    const participantsChannel = supabase.channel('space-participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_participants',
          filter: `space_id=eq.${spaceId}`
        },
        () => {
          console.log('Participants changed, fetching updates');
          fetchParticipants();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for speaker requests
    const requestsChannel = supabase.channel('speaker-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_speaker_requests',
          filter: `space_id=eq.${spaceId}`
        },
        () => {
          console.log('Speaker requests changed, fetching updates');
          fetchSpeakerRequests();
        }
      )
      .subscribe();

    // Initial data fetch
    fetchData();

    return () => {
      console.log('Cleaning up space management subscriptions');
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(requestsChannel);
      leaveChannel();
    };
  }, [spaceId, isOpen, session?.user?.id]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('space_participants')
        .select('*, profile:profiles(*)')
        .eq('space_id', spaceId);

      if (error) throw error;
      console.log('Updated participants:', data);
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error("Failed to load participants");
    }
  };

  const fetchSpeakerRequests = async () => {
    if (!isHost) return;
    
    try {
      const { data, error } = await supabase
        .from('space_speaker_requests')
        .select('*, profile:profiles(*)')
        .eq('space_id', spaceId)
        .eq('status', 'pending');

      if (error) throw error;
      console.log('Updated speaker requests:', data);
      setSpeakerRequests(data || []);
    } catch (error) {
      console.error('Error fetching speaker requests:', error);
      toast.error("Failed to load speaker requests");
    }
  };

  const fetchData = async () => {
    await Promise.all([
      fetchParticipants(),
      fetchSpeakerRequests(),
      fetchUserRole()
    ]);
  };

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('space_participants')
        .select('role')
        .eq('space_id', spaceId)
        .eq('user_id', session?.user?.id)
        .single();

      if (error) throw error;
      if (data) {
        console.log('User role updated:', data.role);
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

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
      setHasRaisedHand(true);
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isHost && (
          <RecordingStatus
            isRecording={isRecording}
            duration={recordingDuration}
          />
        )}
        
        <SpaceAudioIndicator
          isConnected={isConnected}
          isSpeaking={isSpeaker && !isMuted}
        />
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
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
              hasRaisedHand={hasRaisedHand}
              toggleMute={toggleMute}
              onRequestSpeak={handleRequestToSpeak}
              onLeave={onLeave}
              onEndSpace={handleEndSpace}
            />
            <SpaceParticipantsList 
              participants={participants}
              spaceId={spaceId}
              canManageParticipants={isHost || userRole === 'co_host'}
              currentUserId={session?.user?.id}
              onParticipantUpdate={fetchData}
            />
            <SpaceReactions onReaction={handleRequestToSpeak} />
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            <SpaceChat
              messages={[]} // Placeholder for chat messages
              onSendMessage={(content) => console.log(content)} // Placeholder for send message function
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
