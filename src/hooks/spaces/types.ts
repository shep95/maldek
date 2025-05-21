
export type SpaceRole = 'host' | 'co_host' | 'speaker' | 'listener';

export interface Participant {
  userId: string;
  role: string;
  name?: string;
  image?: string;
}

export interface RTCPeerData {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface SpaceHeaderProps {
  isHost: boolean;
  isRecording: boolean;
  recordingDuration: number;
  isConnected: boolean;
  isSpeaking: boolean;
}
