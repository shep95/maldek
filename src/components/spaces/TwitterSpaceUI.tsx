
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Users, Hand, X, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetStreamSpaces } from '@/hooks/spaces/useGetStreamSpaces';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';

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
  const {
    isConnected,
    isLoading,
    error,
    participants,
    isMuted,
    toggleMute
  } = useGetStreamSpaces(spaceId);
  
  const isHost = session?.user?.id === hostId;
  const isSpeaker = isHost || participants.some(p => 
    p.id === session?.user?.id && p.role === 'speaker'
  );
  
  const handleRequestToSpeak = () => {
    toast.success("Request to speak sent!");
    // Implementation would be added with actual GetStream API
  };
  
  const speakers = participants.filter(p => p.role === 'speaker' || p.id === hostId);
  const listeners = participants.filter(p => p.role !== 'speaker' && p.id !== hostId);
  
  if (error) {
    toast.error(`Connection error: ${error}`);
  }
  
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
            Requests
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="people" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[420px]">
            {/* Speakers section */}
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium mb-3">Speakers ({speakers.length})</h4>
              <div className="grid grid-cols-3 gap-4">
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="flex flex-col items-center">
                    <Avatar className="h-16 w-16 mb-1">
                      <AvatarImage src={speaker.image} />
                      <AvatarFallback>{speaker.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium text-center truncate w-full">
                      {speaker.name}
                    </p>
                    {speaker.id === hostId && (
                      <Badge variant="secondary" className="mt-1 text-xs">Host</Badge>
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
                  <div key={listener.id} className="flex flex-col items-center">
                    <Avatar className="h-16 w-16 mb-1">
                      <AvatarImage src={listener.image} />
                      <AvatarFallback>{listener.name[0]?.toUpperCase()}</AvatarFallback>
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
          <p className="text-center text-muted-foreground py-8">
            No speaker requests yet
          </p>
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
          {!isHost && !isSpeaker && (
            <Button
              onClick={handleRequestToSpeak}
              variant="secondary"
              size="sm"
              className="rounded-full"
            >
              <Hand className="h-4 w-4 mr-2" />
              Request
            </Button>
          )}
          
          {isSpeaker && (
            <Button
              onClick={toggleMute}
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
