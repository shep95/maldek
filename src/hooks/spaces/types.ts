export interface RTCPeerData {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface Participant {
  userId: string;
  role: string;
}