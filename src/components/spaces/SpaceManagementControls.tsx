import { Button } from "@/components/ui/button";
import { Mic, MicOff, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface SpaceManagementControlsProps {
  isMuted: boolean;
  isHost: boolean;
  isSpeaker: boolean;
  toggleMute: () => void;
  onRequestSpeak: () => void;
  onLeave: () => void;
  onEndSpace: () => void;
}

export const SpaceManagementControls = ({
  isMuted,
  isHost,
  isSpeaker,
  toggleMute,
  onRequestSpeak,
  onLeave,
  onEndSpace
}: SpaceManagementControlsProps) => {
  const handleMicToggle = () => {
    try {
      toggleMute();
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error("Failed to toggle microphone. Please check your permissions.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Controls</h3>
        {(isHost || isSpeaker) && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleMicToggle}
            className={isMuted ? "bg-destructive/10" : "bg-green-500/10"}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {!isHost && !isSpeaker && (
          <Button 
            onClick={onRequestSpeak}
            className="flex-1"
            variant="secondary"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Request to Speak
          </Button>
        )}

        <Button 
          onClick={onLeave}
          variant="destructive"
          className="flex-1"
        >
          Leave Space
        </Button>
      </div>

      {isHost && (
        <Button 
          onClick={onEndSpace}
          className="w-full"
          variant="destructive"
        >
          End Space
        </Button>
      )}
    </div>
  );
};