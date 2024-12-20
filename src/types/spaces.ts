export type SpaceRole = 'host' | 'co_host' | 'speaker' | 'listener';

export interface SpaceParticipant {
  user_id: string;
  role: SpaceRole;
  profile?: {
    username: string;
    avatar_url?: string;
  };
}

export interface SpaceHeaderProps {
  isHost: boolean;
  isRecording: boolean;
  recordingDuration: number;
  isConnected: boolean;
  isSpeaking: boolean;
}