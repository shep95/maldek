
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Users, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSpaceAudioConnection } from "@/hooks/spaces/useSpaceAudioConnection";
import { SpaceManagementDialog } from "./SpaceManagementDialog";

interface TwitterSpaceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
}

interface SpaceData {
  id: string;
  title: string;
  description?: string;
  host_id: string;
  status: string;
  host?: {
    username: string;
    avatar_url?: string;
  };
}

interface Participant {
  user_id: string;
  role: string;
  profile?: {
    username: string;
    avatar_url?: string;
  };
}

export const TwitterSpaceDialog = ({ isOpen, onOpenChange, spaceId }: TwitterSpaceDialogProps) => {
  const session = useSession();
  const [space, setSpace] = useState<SpaceData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userRole, setUserRole] = useState<string>('listener');
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

    const fetchSpaceData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch space details
        const { data: spaceData, error: spaceError } = await supabase
          .from('spaces')
          .select(`
            *,
            host:profiles!spaces_host_id_fkey(
              username,
              avatar_url
            )
          `)
          .eq('id', spaceId)
          .single();

        if (spaceError) throw spaceError;
        setSpace(spaceData);

        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('space_participants')
          .select(`
            *,
            profile:profiles(
              username,
              avatar_url
            )
          `)
          .eq('space_id', spaceId);

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);

        // Get user's role
        const userParticipant = participantsData?.find(p => p.user_id === session.user.id);
        if (userParticipant) {
          setUserRole(userParticipant.role);
        }

        // Join audio channel if user is a speaker or host
        if (userParticipant && ['host', 'co_host', 'speaker'].includes(userParticipant.role)) {
          await joinChannel(session.user.id);
        }

      } catch (error) {
        console.error('Error fetching space data:', error);
        toast.error('Failed to load space');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpaceData();

    // Set up real-time subscriptions
    const participantsChannel = supabase
      .channel('space-participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_participants',
          filter: `space_id=eq.${spaceId}`
        },
        () => fetchSpaceData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      leaveChannel();
    };
  }, [spaceId, isOpen, session?.user?.id]);

  const handleLeave = async () => {
    try {
      if (userRole === 'host') {
        // Host ending the space
        const { error } = await supabase
          .from('spaces')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', spaceId);

        if (error) throw error;
        toast.success('Space ended');
      } else {
        // Regular participant leaving
        const { error } = await supabase
          .from('space_participants')
          .delete()
          .eq('space_id', spaceId)
          .eq('user_id', session?.user?.id);

        if (error) throw error;
        toast.success('Left space');
      }

      await leaveChannel();
      onOpenChange(false);
    } catch (error) {
      console.error('Error leaving space:', error);
      toast.error('Failed to leave space');
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[600px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading space...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!space) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[600px]">
          <div className="flex items-center justify-center h-full">
            <p>Space not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const hosts = participants.filter(p => p.role === 'host' || p.role === 'co_host');
  const speakers = participants.filter(p => p.role === 'speaker');
  const listeners = participants.filter(p => p.role === 'listener');
  const isSpeaker = ['host', 'co_host', 'speaker'].includes(userRole);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{space.title}</DialogTitle>
            {space.description && (
              <p className="text-sm text-muted-foreground">{space.description}</p>
            )}
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  {isReconnecting ? 'Reconnecting...' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{participants.length} listening</span>
              </div>
            </div>

            {/* Hosts Section */}
            {hosts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Hosts</h3>
                <div className="flex flex-wrap gap-2">
                  {hosts.map((host) => (
                    <div key={host.user_id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {host.profile?.username?.[0]?.toUpperCase() || 'H'}
                      </div>
                      <span className="text-sm">{host.profile?.username || 'Host'}</span>
                      <Mic className="h-3 w-3 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers Section */}
            {speakers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Speakers</h3>
                <div className="flex flex-wrap gap-2">
                  {speakers.map((speaker) => (
                    <div key={speaker.user_id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {speaker.profile?.username?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <span className="text-sm">{speaker.profile?.username || 'Speaker'}</span>
                      <Mic className="h-3 w-3 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listeners Section */}
            {listeners.length > 0 && (
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Listeners ({listeners.length})
                </h3>
                <div className="overflow-y-auto max-h-32">
                  <div className="grid grid-cols-4 gap-2">
                    {listeners.map((listener) => (
                      <div key={listener.user_id} className="flex flex-col items-center text-center p-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {listener.profile?.username?.[0]?.toUpperCase() || 'L'}
                        </div>
                        <span className="text-xs mt-1 truncate w-full">
                          {listener.profile?.username || 'Listener'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {isSpeaker && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMuteToggle}
                  className={isMuted ? "bg-red-500/10 border-red-500" : "bg-green-500/10 border-green-500"}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsManagementOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleLeave} variant="destructive">
              {userRole === 'host' ? 'End Space' : 'Leave'}
            </Button>
          </div>

          {audioError && (
            <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded">
              Audio error: {audioError}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SpaceManagementDialog
        isOpen={isManagementOpen}
        onOpenChange={setIsManagementOpen}
        spaceId={spaceId}
        isHost={userRole === 'host'}
        onLeave={handleLeave}
      />
    </>
  );
};
