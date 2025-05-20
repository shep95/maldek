
export interface RTCPeerData {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface Participant {
  userId: string;
  name?: string;
  image?: string;
  role: string;
  isSpeaking?: boolean;
}

export type SpaceRole = 'host' | 'co_host' | 'speaker' | 'listener';
