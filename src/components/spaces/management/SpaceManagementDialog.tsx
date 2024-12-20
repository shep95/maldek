import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { SpaceManagementControls } from "./SpaceManagementControls";
import { SpaceParticipantsList } from "./SpaceParticipantsList";
import { SpaceSpeakerRequests } from "../SpaceSpeakerRequests";
import { SpaceChat } from "../features/SpaceChat";
import { SpaceReactions } from "../features/SpaceReactions";
import { SpaceHeader } from "./SpaceHeader";
import { useSpaceParticipants } from "./hooks/useSpaceParticipants";
import { useSpaceAudio } from "./hooks/useSpaceAudio";
import { useState as useRecordingState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [userRole, setUserRole] = useState<string>("listener");
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [recordingDuration, setRecordingDuration] = useRecordingState(0);
  const [isRecording, setIsRecording] = useRecordingState(false);

  const {
    participants,
    speakerRequests,
    refetchParticipants,
    refetchRequests
  } = useSpaceParticipants(spaceId);

  const {
    isConnected,
    isMuted,
    isReconnecting,
    audioError,
    handleMuteToggle,
    joinChannel,
    leaveChannel
  } = useSpaceAudio(spaceId, session?.user?.id || '');

  useEffect(() => {
    if (!isOpen || !spaceId || !session?.user?.id) return;

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('space_participants')
          .select('role')
          .eq('space_id', spaceId)
          .eq('user_id', session.user.id)
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

    fetchUserRole();
    joinChannel(session.user.id);

    return () => {
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
      refetchRequests();
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

  if (audioError && !isReconnecting) {
    toast.error(`Audio error: ${audioError}`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <SpaceHeader
          isHost={isHost}
          isRecording={isRecording}
          recordingDuration={recordingDuration}
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
              toggleMute={handleMuteToggle}
              onRequestSpeak={handleRequestToSpeak}
              onLeave={onLeave}
              onEndSpace={handleEndSpace}
            />
            <SpaceParticipantsList 
              participants={participants}
              spaceId={spaceId}
              canManageParticipants={isHost || userRole === 'co_host'}
              currentUserId={session?.user?.id}
              onParticipantUpdate={refetchParticipants}
            />
            <SpaceReactions onReaction={handleRequestToSpeak} />
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            <SpaceChat
              messages={[]}
              onSendMessage={(content) => console.log(content)}
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