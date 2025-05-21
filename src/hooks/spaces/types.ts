
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

// Updated Space interface to include all needed fields
export interface Space {
  id: string;
  title: string;
  description?: string;
  host_id: string;
  started_at?: string;
  ended_at?: string;
  status: 'scheduled' | 'live' | 'ended';
  is_recorded?: boolean;
  is_recording?: boolean;
  recording_url?: string;
  participants_count?: number;
  chat_enabled?: boolean;
  reactions_enabled?: boolean;
  category?: string;
  host?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
}
