import { useRef } from 'react';
import { RTCPeerData } from './types';
import { toast } from 'sonner';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export const usePeerConnections = () => {
  const peersRef = useRef<Map<string, RTCPeerData>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const connectionTimeoutsRef = useRef<Map<string, number>>(new Map());

  const createPeerConnection = (remoteUserId: string) => {
    console.log('Creating new peer connection for:', remoteUserId);
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add connection state monitoring
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${remoteUserId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        console.error('Connection failed for peer:', remoteUserId);
        handleConnectionFailure(remoteUserId);
      }
    };

    return peerConnection;
  };

  const handleConnectionFailure = (remoteUserId: string) => {
    const peer = peersRef.current.get(remoteUserId);
    if (peer) {
      console.log('Attempting to reconnect with peer:', remoteUserId);
      peer.connection.close();
      peersRef.current.delete(remoteUserId);
      toast.error('Connection lost with a participant. Attempting to reconnect...');
    }
  };

  const initializePeerConnection = async (
    remoteUserId: string,
    sendSignalingMessage: (message: any) => void
  ) => {
    console.log('Initializing peer connection for user:', remoteUserId);
    
    try {
      const peerConnection = createPeerConnection(remoteUserId);

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

      // Set connection timeout
      connectionTimeoutsRef.current.set(remoteUserId, 
        window.setTimeout(() => {
          if (peerConnection.connectionState !== 'connected') {
            console.error('Connection timeout for peer:', remoteUserId);
            handleConnectionFailure(remoteUserId);
          }
        }, 15000) // 15 second timeout
      );

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
      const peerConnection = createPeerConnection(message.from);

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
    // Clear all connection timeouts
    connectionTimeoutsRef.current.forEach((timeout) => {
      window.clearTimeout(timeout);
    });
    connectionTimeoutsRef.current.clear();

    // Close all peer connections
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