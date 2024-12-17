import { useRef } from 'react';
import { RTCPeerData } from './types';

export const usePeerConnections = () => {
  const peersRef = useRef<Map<string, RTCPeerData>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const initializePeerConnection = async (
    remoteUserId: string,
    sendSignalingMessage: (message: any) => void
  ) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: remoteUserId
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const peer = peersRef.current.get(remoteUserId);
      if (peer) {
        peer.stream = event.streams[0];
        peersRef.current.set(remoteUserId, peer);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    peersRef.current.set(remoteUserId, {
      userId: remoteUserId,
      connection: peerConnection
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendSignalingMessage({
      type: 'offer',
      offer,
      to: remoteUserId
    });
  };

  const handleOffer = async (
    message: any,
    sendSignalingMessage: (message: any) => void
  ) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: message.from
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const peer = peersRef.current.get(message.from);
      if (peer) {
        peer.stream = event.streams[0];
        peersRef.current.set(message.from, peer);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    peersRef.current.set(message.from, {
      userId: message.from,
      connection: peerConnection
    });

    await peerConnection.setRemoteDescription(message.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendSignalingMessage({
      type: 'answer',
      answer,
      to: message.from
    });
  };

  const cleanupPeerConnections = () => {
    peersRef.current.forEach(peer => {
      peer.connection.close();
    });
    peersRef.current.clear();
  };

  return {
    peersRef,
    localStreamRef,
    initializePeerConnection,
    handleOffer,
    cleanupPeerConnections
  };
};