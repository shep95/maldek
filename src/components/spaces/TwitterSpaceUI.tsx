
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Users, Hand, X, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSpaceRTC } from '@/hooks/useSpaceRTC';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface TwitterSpaceUIProps {
  spaceId: string;
  spaceName: string;
  spaceDescription?: string;
  hostId: string;
  hostName: string;
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
  const [activeTab, setActiveTab] = useState("people");
  const [speakerRequests, setSpeakerRequests] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const {
    isConnected,
    isMuted,
    error,
    participants,
    userRole,
    toggleMute,
    cleanup
  } = useSpaceRTC(spaceId);
  
  const isHost = session?.user?.id === hostId;
  const isSpeaker = userRole === 'speaker' || userRole === 'host' || userRole === 'co_host';
  
  useEffect(() => {
    // Load speaker requests for the host
    if (isHost) {
      const fetchSpeakerRequests = async () => {
        const { data, error } = await supabase
          .from('space_speaker_requests')
          .select('*, profile:profiles(*)')
          .eq('space_id', spaceId)
          .eq('status', 'pending');
          
        if (error) {
          console.error('Error fetching speaker requests:', error);
        } else {
          setSpeakerRequests(data || []);
        }
      };
      
      fetchSpeakerRequests();
      
      // Subscribe to speaker request changes
      const channel = supabase
        .channel('speaker-requests')
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
    }
  }, [spaceId, isHost, session?.user?.id]);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  
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
      toast.success("Request to speak sent to host!");
    } catch (err) {
      toast.error("Failed to send request");
      console.error(err);
    }
  };
  
  const handleApproveSpeaker = async (requestId: string, userId: string) => {
    try {
      // First update the participant role to speaker
      const { error: updateError } = await supabase
        .from('space_participants')
        .update({ role: 'speaker' })
        .eq('space_id', spaceId)
        .eq('user_id', userId);
        
      if (updateError) throw updateError;
      
      // Then mark the request as approved
      const { error } = await supabase
        .from('space_speaker_requests')
        .update({
          status: 'approved',
          resolved_at: new Date().toISOString(),
          resolved_by: session?.user?.id
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success(`Speaker request approved`);
    } catch (err) {
      toast.error("Failed to approve speaker");
      console.error(err);
    }
  };

  const handleRejectSpeaker = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('space_speaker_requests')
        .update({
          status: 'rejected',
          resolved_at: new Date().toISOString(),
          resolved_by: session?.user?.id
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success(`Speaker request rejected`);
    } catch (err) {
      toast.error("Failed to reject speaker request");
      console.error(err);
    }
  };

  const handleToggleRecording = async () => {
    if (isHost) {
      try {
        if (!isRecording) {
          // Start recording
          const { error } = await supabase
            .from('spaces')
            .update({
              is_recorded: true,
              recording_started_at: new Date().toISOString()
            })
            .eq('id', spaceId);
            
          if (error) throw error;
          setIsRecording(true);
          toast.success("Recording started");
        } else {
          // Stop recording
          const { error } = await supabase
            .from('spaces')
            .update({
              is_recorded: false,
              recording_ended_at: new Date().toISOString()
            })
            .eq('id', spaceId);
            
          if (error) throw error;
          setIsRecording(false);
          toast.success("Recording stopped");
        }
      } catch (err) {
        toast.error("Failed to toggle recording");
        console.error(err);
      }
    }
  };
  
  const speakers = participants.filter(p => 
    p.role === 'speaker' || p.role === 'host' || p.role === 'co_host'
  );
  const listeners = participants.filter(p => 
    p.role === 'listener'
  );
  
  if (error) {
    toast.error(`Connection error: ${error}`);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="max-w-md mx-auto h-[600px] flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{spaceName}</h3>
            {spaceDescription && (
              <p className="text-sm text-muted-foreground">{spaceDescription}</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Host info */}
        <div className="flex items-center gap-2 mt-4">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={hostAvatar} />
            <AvatarFallback>{hostName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{hostName}</p>
            <Badge variant="outline" className="text-xs">Host</Badge>
          </div>
          {isRecording && (
            <Badge variant="destructive" className="ml-auto">
              REC {formatTime(recordingDuration)}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 p-0 rounded-none">
          <TabsTrigger value="people" className="rounded-none">
            <Users className="h-4 w-4 mr-2" />
            People
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-none">
            <Hand className="h-4 w-4 mr-2" />
            Requests {isHost && speakerRequests.length > 0 && `(${speakerRequests.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="people" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[420px]">
            {/* Speakers section */}
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium mb-3">Speakers ({speakers.length})</h4>
              <div className="grid grid-cols-3 gap-4">
                {speakers.map((speaker) => (
                  <div key={speaker.userId} className="flex flex-col items-center">
                    <Avatar className="h-16 w-16 mb-1">
                      <AvatarImage src={speaker.image} />
                      <AvatarFallback>{speaker.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium text-center truncate w-full">
                      {speaker.name}
                    </p>
                    {speaker.userId === hostId && (
                      <Badge variant="secondary" className="mt-1 text-xs">Host</Badge>
                    )}
                    {speaker.role === 'co_host' && (
                      <Badge variant="outline" className="mt-1 text-xs">Co-host</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Listeners section */}
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Listening ({listeners.length})</h4>
              <div className="grid grid-cols-3 gap-4">
                {listeners.map((listener) => (
                  <div key={listener.userId} className="flex flex-col items-center">
                    <Avatar className="h-16 w-16 mb-1">
                      <AvatarImage src={listener.image} />
                      <AvatarFallback>{listener.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium text-center truncate w-full">
                      {listener.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="requests" className="flex-1 p-4 m-0">
          {isHost ? (
            speakerRequests.length > 0 ? (
              <div className="space-y-3">
                {speakerRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.profile?.avatar_url} />
                        <AvatarFallback>{request.profile?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{request.profile?.username || 'Unknown user'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleApproveSpeaker(request.id, request.user_id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRejectSpeaker(request.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No speaker requests yet
              </p>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center text-muted-foreground mb-4">
                Want to speak in this space?
              </p>
              <Button
                onClick={handleRequestToSpeak}
                variant="default"
                className="rounded-full"
              >
                <Hand className="h-4 w-4 mr-2" />
                Request to Speak
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Controls */}
      <div className="p-4 border-t bg-background flex items-center justify-between">
        <div className="flex items-center">
          <Badge variant={isConnected ? "secondary" : "destructive"} className="mr-2">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {participants.length} people
          </span>
        </div>
        
        <div className="flex gap-2">
          {isSpeaker && (
            <Button
              onClick={() => toggleMute()}
              variant={isMuted ? "destructive" : "default"}
              size="icon"
              className="rounded-full"
            >
              {isMuted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}

          {isHost && (
            <Button
              onClick={handleToggleRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className={isRecording ? "animate-pulse" : ""}
            >
              {isRecording ? "Stop Recording" : "Record"}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
