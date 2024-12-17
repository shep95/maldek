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
      console.log('Attempting to toggle microphone');
      toggleMute();
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error("Failed to toggle microphone. Please check your permissions.");
    }
  };

  const handleLeave = () => {
    if (isHost) {
      console.log('Host is leaving, ending space');
      onEndSpace();
    } else {
      console.log('Participant is leaving space');
      onLeave();
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
            className={`${isMuted ? "bg-destructive/10" : "bg-green-500/10"} relative`}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isMuted ? "Unmute microphone" : "Mute microphone"}
            </span>
            <div className="absolute -top-8 whitespace-nowrap text-xs">
              {isMuted ? "Click to unmute" : "Click to mute"}
            </div>
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
          onClick={handleLeave}
          variant="destructive"
          className="flex-1"
        >
          {isHost ? "End & Leave Space" : "Leave Space"}
        </Button>
      </div>
    </div>
  );
};