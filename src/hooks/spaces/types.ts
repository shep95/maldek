
export interface RTCPeerData {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface Participant {
  userId: string;
  role: string;
  name: string;
  image?: string;
}

export interface SignalingMessage {
  type: string;
  from?: string;
  to?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidate;
  userId?: string;
  role?: string;
  userName?: string;
  userImage?: string;
  targetUserId?: string;
  newRole?: string;
}
