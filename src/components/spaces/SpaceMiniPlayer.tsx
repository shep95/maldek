
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  Settings, 
  Users, 
  Phone, 
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceSettingsDialog } from './SpaceSettingsDialog';
import { TwitterSpaceDialog } from './TwitterSpaceDialog';

export const SpaceMiniPlayer = () => {
  const { currentSpace, leaveSpace } = useSpace();
  const [showSettings, setShowSettings] = useState(false);
  const [showFullSpace, setShowFullSpace] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);

  if (!currentSpace) return null;

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleDeafen = () => {
    setIsDeafened(!isDeafened);
  };

  return (
    <>
      <Card className="fixed bottom-4 right-4 z-50 w-80 bg-background/95 backdrop-blur-sm border-accent/20 shadow-lg">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">In Space</span>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {currentSpace.participants_count || 0}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFullSpace(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-3">
            <h4 className="font-medium text-sm truncate">{currentSpace.title}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {currentSpace.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={isDeafened ? "destructive" : "outline"}
                size="sm"
                onClick={handleToggleDeafen}
                className="h-8 w-8 p-0"
              >
                {isDeafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={leaveSpace}
              className="gap-1"
            >
              <Phone className="h-3 w-3" />
              Leave
            </Button>
          </div>
        </div>
      </Card>

      <SpaceSettingsDialog
        isOpen={showSettings}
        onOpenChange={setShowSettings}
      />

      {showFullSpace && (
        <TwitterSpaceDialog
          isOpen={showFullSpace}
          onOpenChange={setShowFullSpace}
          spaceId={currentSpace.id}
        />
      )}
    </>
  );
};
