import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, UserPlus2, Users, X, MessageSquare, Settings, Loader2, WifiOff, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSpaceSignaling } from "@/hooks/spaces/useSpaceSignaling";
import { useAudioStream } from "@/hooks/spaces/useAudioStream";
import { useAudioLevelDetector } from "@/hooks/spaces/useAudioLevelDetector";
import { useAudioDevices } from "@/hooks/spaces/useAudioDevices";
import { AudioDeviceSelector } from "@/components/spaces/AudioDeviceSelector";
import { SpaceChat } from "@/components/spaces/chat/SpaceChat";
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

interface RemoteAudioStream {
  userId: string;
  stream: MediaStream;
  audioElement: HTMLAudioElement;
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
  const [participants, setParticipants] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [speakerRequests, setSpeakerRequests] = useState<any[]>([]);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [hasActiveSpeakerRequest, setHasActiveSpeakerRequest] = useState(false);
  const [remoteAudioStreams, setRemoteAudioStreams] = useState<Map<string, RemoteAudioStream>>(new Map());
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  
  const recordingTimerRef = useRef<number | null>(null);
  const cleanupRef = useRef(false);
  
  const { selectedInputDevice } = useAudioDevices();
  const { isConnected, connectToSignalingServer, sendSignalingMessage, websocketRef, cleanup } = useSpaceSignaling(spaceId);
  const { isMuted, isStreaming, isInitializing, startAudio, toggleMute, stopAudio, getStream, error: audioError } = useAudioStream();
  const { audioLevel, isSpeaking } = useAudioLevelDetector(getStream(), isStreaming && (isHost || isSpeaker));

  const currentUserId = session?.user?.id;

  // Memoize grouped participants to prevent unnecessary recalculations
  const groupedParticipants = useMemo(() => {
    const hostParticipants = participants.filter(p => p.role === 'host' || p.role === 'co_host');
    const speakerParticipants = participants.filter(p => p.role === 'speaker');
    const listenerParticipants = participants.filter(p => p.role === 'listener');
    
    return { hostParticipants, speakerParticipants, listenerParticipants };
  }, [participants]);

  // Check if current user is host or speaker - stable reference
  const checkUserRole = useCallback(async () => {
    if (!currentUserId || cleanupRef.current) return;
    
    try {
      const { data: participant } = await supabase
        .from('space_participants')
        .select('role')
        .eq('space_id', spaceId)
        .eq('user_id', currentUserId)
        .single();
        
      if (participant && !cleanupRef.current) {
        const isUserHost = participant.role === 'host' || participant.role === 'co_host';
        const isUserSpeaker = isUserHost || participant.role === 'speaker';
        setIsHost(isUserHost);
        setIsSpeaker(isUserSpeaker);
      }
    } catch (error) {
      if (!cleanupRef.current) {
        console.error('Error checking user role:', error);
      }
    }
  }, [spaceId, currentUserId]);

  // Create peer connection for WebRTC
  const createPeerConnection = useCallback((remoteUserId: string) => {
    console.log('Creating peer connection for:', remoteUserId);
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Handle incoming audio stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote audio track from:', remoteUserId);
      const [remoteStream] = event.streams;
      
      // Create audio element and play the stream
      const audioElement = new Audio();
      audioElement.srcObject = remoteStream;
      audioElement.autoplay = true;
      audioElement.volume = 1.0;
      audioElement.play().catch(console.error);
      
      setRemoteAudioStreams(prev => new Map(prev.set(remoteUserId, {
        userId: remoteUserId,
        stream: remoteStream,
        audioElement
      })));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', remoteUserId);
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: remoteUserId
        });
      }
    };

    // Add local stream if available
    const localStream = getStream();
    if (localStream) {
      console.log('Adding local stream tracks to peer connection');
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    return peerConnection;
  }, [getStream, sendSignalingMessage]);

  // Initiate connection to another peer
  const initiateConnection = useCallback(async (remoteUserId: string) => {
    if (peerConnections.has(remoteUserId)) return;
    
    console.log('Initiating connection to:', remoteUserId);
    const peerConnection = createPeerConnection(remoteUserId);
    
    setPeerConnections(prev => new Map(prev.set(remoteUserId, peerConnection)));
    
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      sendSignalingMessage({
        type: 'offer',
        offer,
        to: remoteUserId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [createPeerConnection, peerConnections, sendSignalingMessage]);

  // Handle WebRTC signaling messages
  const handleWebRTCOffer = useCallback(async (message: any) => {
    if (!message.offer || message.from === currentUserId) return;
    
    console.log('Handling offer from:', message.from);
    const peerConnection = createPeerConnection(message.from);
    
    setPeerConnections(prev => new Map(prev.set(message.from, peerConnection)));
    
    try {
      await peerConnection.setRemoteDescription(message.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      sendSignalingMessage({
        type: 'answer',
        answer,
        to: message.from
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [createPeerConnection, currentUserId, sendSignalingMessage]);

  const handleWebRTCAnswer = useCallback(async (message: any) => {
    if (!message.answer || message.from === currentUserId) return;
    
    const peerConnection = peerConnections.get(message.from);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(message.answer);
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    }
  }, [currentUserId, peerConnections]);

  const handleWebRTCIceCandidate = useCallback(async (message: any) => {
    if (!message.candidate || message.from === currentUserId) return;
    
    const peerConnection = peerConnections.get(message.from);
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(message.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }, [currentUserId, peerConnections]);

  // Check for existing speaker request - stable reference
  const checkExistingSpeakerRequest = useCallback(async () => {
    if (!currentUserId || isHost || isSpeaker || cleanupRef.current) return;
    
    try {
      const { data: existingRequest } = await supabase
        .from('space_speaker_requests')
        .select('id, status')
        .eq('space_id', spaceId)
        .eq('user_id', currentUserId)
        .eq('status', 'pending')
        .single();
        
      if (!cleanupRef.current) {
        setHasActiveSpeakerRequest(!!existingRequest);
      }
    } catch (error) {
      if (!cleanupRef.current) {
        setHasActiveSpeakerRequest(false);
      }
    }
  }, [spaceId, currentUserId, isHost, isSpeaker]);

  // Fetch functions with stable references
  const fetchParticipants = useCallback(async () => {
    if (cleanupRef.current) return;
    
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
    
    if (!cleanupRef.current) {
      setParticipants(data || []);
    }
  }, [spaceId]);

  const fetchSpeakerRequests = useCallback(async () => {
    if (!isHost || cleanupRef.current) return;
    
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
    
    if (!cleanupRef.current) {
      setSpeakerRequests(data || []);
    }
  }, [spaceId, isHost]);

  // Initialize user role on mount
  useEffect(() => {
    checkUserRole();
  }, [checkUserRole]);

  // Check speaker request status when role changes
  useEffect(() => {
    checkExistingSpeakerRequest();
  }, [checkExistingSpeakerRequest]);

  // Connect to signaling server when component mounts
  useEffect(() => {
    console.log('Initializing space connection...');
    connectToSignalingServer();
    
    return () => {
      cleanupRef.current = true;
      cleanup();
      stopAudio();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      // Cleanup peer connections
      peerConnections.forEach(pc => pc.close());
      setPeerConnections(new Map());
      // Cleanup audio streams
      remoteAudioStreams.forEach(({ audioElement }) => {
        audioElement.pause();
        audioElement.src = '';
      });
      setRemoteAudioStreams(new Map());
    };
  }, []); // Only run once on mount

  // Start audio when user becomes a speaker and signaling is connected
  useEffect(() => {
    if ((isHost || isSpeaker) && isConnected && !isStreaming && !isInitializing && !cleanupRef.current) {
      console.log('Initializing audio for speaker/host...', { isHost, isSpeaker, isConnected });
      startAudio().then((stream) => {
        if (stream) {
          // Notify other participants that we're now speaking
          sendSignalingMessage({
            type: 'speaker-joined',
            userId: currentUserId
          });
          
          // Initiate connections to existing participants who can hear us
          participants.forEach(participant => {
            if (participant.user_id !== currentUserId) {
              initiateConnection(participant.user_id);
            }
          });
        }
      }).catch((error) => {
        console.error('Failed to initialize audio:', error);
        if (!cleanupRef.current) {
          toast.error('Failed to connect microphone. Please check permissions.');
        }
      });
    }
  }, [isHost, isSpeaker, isConnected, isStreaming, isInitializing, startAudio, sendSignalingMessage, currentUserId, participants, initiateConnection]);

  // Set up data fetching and realtime subscriptions
  useEffect(() => {
    fetchParticipants();
    fetchSpeakerRequests();
    
    // Set up realtime subscription for participants
    const participantsChannel = supabase
      .channel(`space_${spaceId}_participants`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'space_participants', filter: `space_id=eq.${spaceId}` }, 
        () => {
          if (!cleanupRef.current) {
            fetchParticipants();
          }
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
            if (!cleanupRef.current) {
              fetchSpeakerRequests();
            }
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
  }, [spaceId, isHost, fetchParticipants, fetchSpeakerRequests]);

  // WebSocket message handling
  useEffect(() => {
    if (!websocketRef.current) return;

    const handleWebSocketMessage = (event: MessageEvent) => {
      if (cleanupRef.current) return;
      
      try {
        const message = JSON.parse(event.data);
        console.log('Received signaling message:', message.type);
        
        switch (message.type) {
          case 'speaker-joined':
            if (message.userId !== currentUserId) {
              console.log('Speaker joined, initiating connection');
              initiateConnection(message.userId);
            }
            break;
          case 'offer':
            handleWebRTCOffer(message);
            break;
          case 'answer':
            handleWebRTCAnswer(message);
            break;
          case 'ice-candidate':
            handleWebRTCIceCandidate(message);
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    websocketRef.current.onmessage = handleWebSocketMessage;
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.onmessage = null;
      }
    };
  }, [currentUserId, handleWebRTCOffer, handleWebRTCAnswer, handleWebRTCIceCandidate, initiateConnection]);

  const handleToggleMute = useCallback(() => {
    if (!isStreaming && (isHost || isSpeaker)) {
      toast.error('Audio not connected. Trying to reconnect...');
      startAudio();
      return;
    }
    
    if (!isHost && !isSpeaker) {
      toast.error('You need speaker permissions to use the microphone');
      return;
    }
    
    toggleMute();
  }, [isStreaming, isHost, isSpeaker, startAudio, toggleMute]);

  const handleEndSpace = useCallback(async () => {
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
  }, [isHost, spaceId, onClose]);
  
  const handleRequestToSpeak = useCallback(async () => {
    if (hasActiveSpeakerRequest) {
      toast.info('You already have a pending request to speak');
      return;
    }

    try {
      const { data: existingRequest } = await supabase
        .from('space_speaker_requests')
        .select('id')
        .eq('space_id', spaceId)
        .eq('user_id', currentUserId)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        toast.info('You already have a pending request to speak');
        setHasActiveSpeakerRequest(true);
        return;
      }

      const { error } = await supabase
        .from('space_speaker_requests')
        .insert({
          space_id: spaceId,
          user_id: currentUserId,
          status: 'pending'
        });
        
      if (error) throw error;
      
      setHasActiveSpeakerRequest(true);
      toast.success('Request to speak sent');
    } catch (error) {
      console.error('Error requesting to speak:', error);
      if (error.code === '23505') {
        toast.info('You already have a pending request to speak');
        setHasActiveSpeakerRequest(true);
      } else {
        toast.error('Failed to send request');
      }
    }
  }, [hasActiveSpeakerRequest, spaceId, currentUserId]);

  const handleSpeakerRequest = useCallback(async (requestId: string, userId: string, accept: boolean) => {
    if (!isHost) return;

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
          resolved_by: currentUserId
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Speaker request ${accept ? 'accepted' : 'rejected'}`);
      
      if (userId === currentUserId) {
        setHasActiveSpeakerRequest(false);
      }
    } catch (error) {
      console.error('Error handling speaker request:', error);
      toast.error('Failed to handle request');
    }
  }, [isHost, spaceId, currentUserId]);
  
  const startRecording = useCallback(async () => {
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
      
      recordingTimerRef.current = timer;
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  }, [spaceId]);
  
  const handleStopRecording = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('spaces')
        .update({ 
          recording_url: `https://storage.example.com/spaces/${spaceId}.mp3` 
        })
        .eq('id', spaceId);
        
      if (error) throw error;
      
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      toast.success('Recording saved');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to save recording');
    }
  }, [spaceId]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

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
            {remoteAudioStreams.size > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                Listening to {remoteAudioStreams.size} speaker{remoteAudioStreams.size !== 1 ? 's' : ''}
              </Badge>
            )}
            {isHost && speakerRequests.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700">
                <UserPlus2 className="h-3 w-3" />
                {speakerRequests.length} request{speakerRequests.length !== 1 ? 's' : ''}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Participants Area */}
        <div className={`flex-1 overflow-y-auto p-4 ${showChat ? 'max-h-[60%]' : ''}`}>
          {/* Speaker Requests (Host Only) */}
          {isHost && speakerRequests.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <UserPlus2 className="h-4 w-4" />
                Speaker Requests ({speakerRequests.length})
              </h3>
              <div className="space-y-3">
                {speakerRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.profile?.avatar_url} />
                        <AvatarFallback>{request.profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">{request.profile?.username}</span>
                        <p className="text-xs text-muted-foreground">Wants to speak</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSpeakerRequest(request.id, request.user_id, false)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSpeakerRequest(request.id, request.user_id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hosts */}
          <div className="mb-6">
            <h3 className="text-xs text-muted-foreground mb-2">Host</h3>
            <div className="flex flex-wrap gap-4">
              {groupedParticipants.hostParticipants.map(participant => (
                <div key={participant.user_id} className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-accent">
                      <AvatarImage src={participant.profile?.avatar_url} />
                      <AvatarFallback>{participant.profile?.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 border border-background">
                      {participant.user_id === currentUserId && (isHost || isSpeaker) ? (
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
                    {participant.user_id === currentUserId && (isHost || isSpeaker) && audioLevel > 0 && (
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
          {groupedParticipants.speakerParticipants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs text-muted-foreground mb-2">Speakers</h3>
              <div className="flex flex-wrap gap-4">
                {groupedParticipants.speakerParticipants.map(participant => (
                  <div key={participant.user_id} className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={participant.profile?.avatar_url} />
                        <AvatarFallback>{participant.profile?.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 border border-background">
                        {participant.user_id === currentUserId && isSpeaker ? (
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
                      {participant.user_id === currentUserId && isSpeaker && audioLevel > 0 && (
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

          {/* Listeners */}
          <div>
            <h3 className="text-xs text-muted-foreground mb-2">Listening ({groupedParticipants.listenerParticipants.length})</h3>
            <div className="flex flex-wrap gap-3">
              {groupedParticipants.listenerParticipants.map(participant => (
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

        {/* Chat Area */}
        <SpaceChat spaceId={spaceId} isVisible={showChat} />
      </div>

      {/* Controls */}
      <div className="border-t p-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {(isHost || isSpeaker) ? (
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
                disabled={hasActiveSpeakerRequest}
              >
                <UserPlus2 className="h-4 w-4" />
                {hasActiveSpeakerRequest ? "Request Pending" : "Request to speak"}
              </Button>
            )}
            
            <Button
              variant={showChat ? "default" : "outline"}
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
