import { SpaceAudioIndicator } from "../features/SpaceAudioIndicator";
import { RecordingStatus } from "../recording/RecordingStatus";

interface SpaceHeaderProps {
  isHost: boolean;
  isRecording: boolean;
  recordingDuration: number;
  isConnected: boolean;
  isSpeaking: boolean;
}

export const SpaceHeader = ({
  isHost,
  isRecording,
  recordingDuration,
  isConnected,
  isSpeaking
}: SpaceHeaderProps) => {
  return (
    <div className="space-y-4">
      {isHost && (
        <RecordingStatus
          isRecording={isRecording}
          duration={recordingDuration}
        />
      )}
      
      <SpaceAudioIndicator
        isConnected={isConnected}
        isSpeaking={isSpeaking}
      />
    </div>
  );
};