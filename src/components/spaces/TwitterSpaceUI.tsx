import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, UserPlus2, Users, X, MessageSquare, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSpaceSignaling } from "@/hooks/spaces/useSpaceSignaling";
import { Space } from "@/hooks/spaces/types";
import { useImprovedAudioStream } from "@/hooks/spaces/useImprovedAudioStream";
import { useSpace } from "@/contexts/SpaceContext";

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
  const { leaveSpace } = useSpace();
  const [isHost, setIsHost] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<number | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  
  const { isConnected, connectToSignalingServer, sendSignalingMessage, websocketRef, cleanup } = useSpaceSignaling(spaceId);
  const { 
    isMuted, 
    isDeafened,
    isStreaming, 
    audioLevel,
    error: audioError,
    startAudio, 
    toggleMute, 
    toggleDeafen,
    stopAudio 
  } = useImprovedAudioStream();

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

  // Connect to signaling server and start audio when component mounts
  useEffect(() => {
    connectToSignalingServer();
    
    return () => {
      cleanup();
      stopAudio();
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, []);

  // Load participants
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
    
    fetchParticipants();
    
    // Set up realtime subscription for participants
    const channel = supabase
      .channel(`space_${spaceId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'space_participants', filter: `space_id=eq.${spaceId}` }, 
        () => {
          fetchParticipants();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

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
  }, [isConnected, isSpeaker, isStreaming, startAudio]);

  const handleToggleMute = () => {
    toggleMute();
  };

  const handleToggleDeafen = () => {
    toggleDeafen();
  };

  const handleLeaveSpace = () => {
    cleanup();
    stopAudio();
    leaveSpace();
    onClose();
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
  
  const startRecording = async () => {
    try {
      // Update space to mark as recorded
      const { error } = await supabase
        .from('spaces')
        .update({ 
          features: { recorded: true } // Fix: Using features JSON field instead
        })
        .eq('id', spaceId);
        
      if (error) throw error;
      
      setIsRecording(true);
      
      // Start a timer to track recording duration
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
      // Update space to keep recording flag but add URL
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
            {isConnected && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                Connected
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
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLeaveSpace}
          className="rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
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
                    <Mic className="h-3 w-3 text-accent" />
                  </div>
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
                      <Mic className="h-3 w-3" />
                    </div>
                  </div>
                  <span className="text-xs mt-1">{participant.profile?.username || 'Unknown'}</span>
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
              <>
                <Button
                  variant={isMuted ? "destructive" : "default"}
                  size="sm"
                  onClick={handleToggleMute}
                  className="gap-1"
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                
                <Button
                  variant={isDeafened ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleToggleDeafen}
                  className="gap-1"
                >
                  {isDeafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isDeafened ? "Undeafen" : "Deafen"}
                </Button>

                {/* Audio Level Indicator */}
                {audioLevel > 0 && !isMuted && (
                  <div className="flex items-center gap-1 px-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full ${
                            i < Math.floor(audioLevel / 20) ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{ height: `${6 + (i * 2)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
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

          {isHost && (
            <div>
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
            </div>
          )}
        </div>

        {/* Connection Status */}
        {audioError && (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
            {audioError}
          </div>
        )}
      </div>
    </Card>
  );
};
