import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useSpaceAudioConnection } from "@/hooks/spaces/useSpaceAudioConnection";
import { SpaceChatPanel } from "../chat/SpaceChatPanel";
import { SpeakerRequestsPanel } from "./SpeakerRequestsPanel";
import { ParticipantManagementPanel } from "./ParticipantManagementPanel";
import { SpaceHeader } from "./SpaceHeader";

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

  const {
    isConnected,
    isMuted,
    isReconnecting,
    audioError,
    handleMuteToggle,
    joinChannel,
    leaveChannel
  } = useSpaceAudioConnection(spaceId, session?.user?.id || '');

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
        toast.error('Failed to fetch user role');
      }
    };

    fetchUserRole();
    joinChannel(session.user.id);

    return () => {
      leaveChannel();
    };
  }, [spaceId, isOpen, session?.user?.id]);

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

  if (audioError && !isReconnecting) {
    toast.error(`Audio error: ${audioError}`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <SpaceHeader
          isHost={isHost}
          isConnected={isConnected}
          isSpeaking={userRole !== 'listener' && !isMuted}
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

          <TabsContent value="participants">
            <ParticipantManagementPanel
              spaceId={spaceId}
              currentUserId={session?.user?.id}
              isHost={isHost}
            />
          </TabsContent>

          <TabsContent value="chat">
            <SpaceChatPanel
              spaceId={spaceId}
              userId={session?.user?.id || ''}
            />
          </TabsContent>

          <TabsContent value="requests">
            <SpeakerRequestsPanel
              spaceId={spaceId}
              isHost={isHost}
              onRequestHandled={() => {
                toast.success('Speaker request handled');
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};