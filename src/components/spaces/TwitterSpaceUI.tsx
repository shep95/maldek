import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, UserPlus2, Users, X, MessageSquare, Settings, Loader2, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSpaceSignaling } from "@/hooks/spaces/useSpaceSignaling";
import { useAudioStream } from "@/hooks/spaces/useAudioStream";
import { useAudioLevelDetector } from "@/hooks/spaces/useAudioLevelDetector";
import { useAudioDevices } from "@/components/spaces/AudioDeviceSelector";
import { AudioDeviceSelector } from "@/components/spaces/AudioDeviceSelector";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TwitterSpaceUIProps {
  spaceId: string;
  spaceName: string;
  spaceDescription?: string;
  hostId: string;
  hostName?: string;
  hostAvatar?: string;
  onClose: () => void;
}

export const TwitterSpaceUI = ({
  spaceId,
  spaceName,
  spaceDescription,
  hostId,
  hostName,
  hostAvatar,
  onClose
}: TwitterSpaceUIProps) => {
  const session = useSession();
  const [isHost, setIsHost] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<number | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [speakerRequests, setSpeakerRequests] = useState<any[]>([]);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  
  const { selectedInputDevice } = useAudioDevices();
  const { isConnected, connectToSignalingServer, sendSignalingMessage, websocketRef, cleanup } = useSpaceSignaling(spaceId);
  const { isMuted, isStreaming, isInitializing, startAudio, toggleMute, stopAudio, getStream, error: audioError } = useAudioStream(selectedInputDevice);
  const { audioLevel, isSpeaking } = useAudioLevelDetector(getStream(), isStreaming && (isHost || isSpeaker));

  // Check if current user is host or speaker
  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.id) return;
      
      try {
        const { data: participant } = await supabase
          .from('space_participants')
          .select('role')
          .eq('space_id', spaceId)
          .eq('user_id', session.user.id)
          .single();
          
        if (participant) {
          const isUserHost = participant.role === 'host' || participant.role === 'co_host';
          setIsHost(isUserHost);
          setIsSpeaker(isUserHost || participant.role === 'speaker');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, [spaceId, session?.user?.id]);

  // Connect to signaling server when component mounts
  useEffect(() => {
    console.log('Initializing space connection...');
    connectToSignalingServer();
    
    return () => {
      cleanup();
      stopAudio();
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, []);

  // Start audio when user becomes a speaker and signaling is connected
  useEffect(() => {
    const initializeAudio = async () => {
      if (isSpeaker && isConnected && !isStreaming && !isInitializing) {
        console.log('Initializing audio for speaker...');
        await startAudio();
      }
    };
    
    initializeAudio();
  }, [isSpeaker, isConnected, isStreaming, isInitializing]);

  // Load participants and speaker requests
  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('space_participants')
        .select(`
          user_id,
          role,
          profile:profiles(
            username,
            avatar_url
          )
        `)
        .eq('space_id', spaceId);
        
      if (error) {
        console.error('Error fetching participants:', error);
        return;
      }
      
      setParticipants(data || []);
    };

    const fetchSpeakerRequests = async () => {
      if (!isHost) return;
      
      const { data, error } = await supabase
        .from('space_speaker_requests')
        .select(`
          *,
          profile:profiles!space_speaker_requests_user_id_fkey(
            username,
            avatar_url
          )
        `)
        .eq('space_id', spaceId)
        .eq('status', 'pending');
        
      if (error) {
        console.error('Error fetching speaker requests:', error);
        return;
      }
      
      setSpeakerRequests(data || []);
    };
    
    fetchParticipants();
    fetchSpeakerRequests();
    
    // Set up realtime subscription for participants
    const participantsChannel = supabase
      .channel(`space_${spaceId}_participants`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'space_participants', filter: `space_id=eq.${spaceId}` }, 
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    // Set up realtime subscription for speaker requests (only for hosts)
    let requestsChannel;
    if (isHost) {
      requestsChannel = supabase
        .channel(`space_${spaceId}_requests`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'space_speaker_requests', filter: `space_id=eq.${spaceId}` }, 
          () => {
            fetchSpeakerRequests();
          }
        )
        .subscribe();
    }
      
    return () => {
      supabase.removeChannel(participantsChannel);
      if (requestsChannel) {
        supabase.removeChannel(requestsChannel);
      }
    };
  }, [spaceId, isHost]);

  // Start audio stream if user is a speaker
  useEffect(() => {
    const initializeAudio = async () => {
      if (isSpeaker && !isStreaming) {
        await startAudio();
      }
    };
    
    if (isConnected) {
      initializeAudio();
    }
  }, [isConnected, isSpeaker, isStreaming]);

  const handleToggleMute = () => {
    if (!isStreaming && isSpeaker) {
      toast.error('Audio not connected. Trying to reconnect...');
      startAudio();
      return;
    }
    toggleMute();
  };

  const handleEndSpace = async () => {
    if (!isHost) {
      toast.error("Only the host can end the space");
      return;
    }

    try {
      const { error } = await supabase
        .from('spaces')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', spaceId);
        
      if (error) throw error;
      
      toast.success('Space ended successfully');
      onClose();
    } catch (error) {
      console.error('Error ending space:', error);
      toast.error('Failed to end space');
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
      toast.success('Request to speak sent');
    } catch (error) {
      console.error('Error requesting to speak:', error);
      toast.error('Failed to send request');
    }
  };

  const handleSpeakerRequest = async (requestId: string, userId: string, accept: boolean) => {
    if (!isHost) return;

    try {
      if (accept) {
        // Update participant role to speaker
        const { error: updateError } = await supabase
          .from('space_participants')
          .update({ role: 'speaker' })
          .eq('space_id', spaceId)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      // Update request status
      const { error } = await supabase
        .from('space_speaker_requests')
        .update({
          status: accept ? 'accepted' : 'rejected',
          resolved_at: new Date().toISOString(),
          resolved_by: session?.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Speaker request ${accept ? 'accepted' : 'rejected'}`);
    } catch (error) {
      console.error('Error handling speaker request:', error);
      toast.error('Failed to handle request');
    }
  };
  
  const startRecording = async () => {
    try {
      const { error } = await supabase
        .from('spaces')
        .update({ 
          features: { recorded: true }
        })
        .eq('id', spaceId);
        
      if (error) throw error;
      
      setIsRecording(true);
      
      const timer = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      setRecordingTimer(timer);
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };
  
  const handleStopRecording = async () => {
    try {
      const { error } = await supabase
        .from('spaces')
        .update({ 
          recording_url: `https://storage.example.com/spaces/${spaceId}.mp3` 
        })
        .eq('id', spaceId);
        
      if (error) throw error;
      
      setIsRecording(false);
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      
      toast.success('Recording saved');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to save recording');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group participants by role
  const hostParticipants = participants.filter(p => p.role === 'host' || p.role === 'co_host');
  const speakerParticipants = participants.filter(p => p.role === 'speaker');
  const listenerParticipants = participants.filter(p => p.role === 'listener');

  return (
    <Card className="flex flex-col h-[80vh] overflow-hidden rounded-xl shadow-2xl border-accent/20 bg-background">
      {/* Space Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex-1">
          <h2 className="font-bold text-lg truncate">{spaceName}</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participants.length}
            </span>
            {!isConnected && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Connecting...
              </Badge>
            )}
            {isInitializing && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Setting up audio...
              </Badge>
            )}
            {audioError && (
              <Badge variant="destructive" className="text-xs">
                Audio Error
              </Badge>
            )}
            {isRecording && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <div className="h-3 w-3 animate-pulse bg-red-500 rounded-full"></div> 
                {formatTime(recordingDuration)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={showAudioSettings} onOpenChange={setShowAudioSettings}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="bottom" align="end">
              <AudioDeviceSelector />
            </PopoverContent>
          </Popover>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Participants Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4">
        {/* Hosts */}
        <div className="mb-6">
          <h3 className="text-xs text-muted-foreground mb-2">Host</h3>
          <div className="flex flex-wrap gap-4">
            {hostParticipants.map(participant => (
              <div key={participant.user_id} className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-accent">
                    <AvatarImage src={participant.profile?.avatar_url} />
                    <AvatarFallback>{participant.profile?.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 border border-background">
                    {participant.user_id === session?.user?.id && isSpeaker ? (
                      <>
                        {isSpeaking ? (
                          <Volume2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <Mic className={`h-3 w-3 ${isMuted ? 'text-red-500' : 'text-accent'}`} />
                        )}
                      </>
                    ) : (
                      <Mic className="h-3 w-3 text-accent" />
                    )}
                  </div>
                  {/* Audio level indicator */}
                  {participant.user_id === session?.user?.id && isSpeaker && audioLevel > 0 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full ${
                            i < audioLevel ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{
                            height: `${4 + (i * 2)}px`,
                            transition: 'all 150ms ease'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{participant.profile?.username || 'Unknown'}</span>
                <Badge variant="secondary" className="text-xs mt-0.5">Host</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Speakers */}
        {speakerParticipants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs text-muted-foreground mb-2">Speakers</h3>
            <div className="flex flex-wrap gap-4">
              {speakerParticipants.map(participant => (
                <div key={participant.user_id} className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant.profile?.avatar_url} />
                      <AvatarFallback>{participant.profile?.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 border border-background">
                      {participant.user_id === session?.user?.id && isSpeaker ? (
                        <>
                          {isSpeaking ? (
                            <Volume2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Mic className={`h-3 w-3 ${isMuted ? 'text-red-500' : 'text-accent'}`} />
                          )}
                        </>
                      ) : (
                        <Mic className="h-3 w-3" />
                      )}
                    </div>
                    {/* Audio level indicator */}
                    {participant.user_id === session?.user?.id && isSpeaker && audioLevel > 0 && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${
                              i < audioLevel ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            style={{
                              height: `${4 + (i * 2)}px`,
                              transition: 'all 150ms ease'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs mt-1">{participant.profile?.username || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Speaker Requests (Host Only) */}
        {isHost && speakerRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs text-muted-foreground mb-2">Speaker Requests</h3>
            <div className="space-y-2">
              {speakerRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-accent/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.profile?.avatar_url} />
                      <AvatarFallback>{request.profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{request.profile?.username}</span>
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
              ))}
            </div>
          </div>
        )}

        {/* Listeners */}
        <div>
          <h3 className="text-xs text-muted-foreground mb-2">Listening ({listenerParticipants.length})</h3>
          <div className="flex flex-wrap gap-3">
            {listenerParticipants.map(participant => (
              <div key={participant.user_id} className="flex flex-col items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant.profile?.avatar_url} />
                  <AvatarFallback>{participant.profile?.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-xs mt-1">{participant.profile?.username || 'Unknown'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t p-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {isSpeaker ? (
              <Button
                variant={isMuted ? "outline" : "default"}
                size="sm"
                onClick={handleToggleMute}
                className="gap-1"
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                {isInitializing ? "Connecting..." : isMuted ? "Unmute" : "Mute"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestToSpeak}
                className="gap-1"
              >
                <UserPlus2 className="h-4 w-4" />
                Request to speak
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          </div>

          <div className="flex gap-2">
            {isHost && (
              <>
                {isRecording ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopRecording}
                    className="gap-1"
                  >
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    Stop Recording
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startRecording}
                    className="gap-1"
                  >
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    Record
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndSpace}
                  className="gap-1"
                >
                  End Space
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
