import { useRef } from 'react';
import { RTCPeerData } from './types';
import { toast } from 'sonner';

export const usePeerConnections = () => {
  const peersRef = useRef<Map<string, RTCPeerData>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const initializePeerConnection = async (
    remoteUserId: string,
    sendSignalingMessage: (message: any) => void
  ) => {
    console.log('Initializing peer connection for user:', remoteUserId);
    
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to:', remoteUserId);
          sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            to: remoteUserId
          });
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'failed') {
          toast.error('Connection failed. Please try reconnecting.');
        }
      };

      peerConnection.ontrack = (event) => {
        console.log('Received remote track from:', remoteUserId);
        const peer = peersRef.current.get(remoteUserId);
        if (peer) {
          peer.stream = event.streams[0];
          peersRef.current.set(remoteUserId, peer);
        }
      };

      if (localStreamRef.current) {
        console.log('Adding local stream tracks to peer connection');
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      } else {
        console.warn('No local stream available when initializing peer connection');
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
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      toast.error('Failed to establish connection. Please try again.');
    }
  };

  const handleOffer = async (
    message: any,
    sendSignalingMessage: (message: any) => void
  ) => {
    console.log('Handling offer from:', message.from);
    
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to:', message.from);
          sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            to: message.from
          });
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'failed') {
          toast.error('Connection failed. Please try reconnecting.');
        }
      };

      peerConnection.ontrack = (event) => {
        console.log('Received remote track from:', message.from);
        const peer = peersRef.current.get(message.from);
        if (peer) {
          peer.stream = event.streams[0];
          peersRef.current.set(message.from, peer);
        }
      };

      if (localStreamRef.current) {
        console.log('Adding local stream tracks to peer connection');
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      } else {
        console.warn('No local stream available when handling offer');
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
    } catch (error) {
      console.error('Error handling offer:', error);
      toast.error('Failed to establish connection. Please try again.');
    }
  };

  const cleanupPeerConnections = () => {
    console.log('Cleaning up peer connections');
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