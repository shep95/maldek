import { useEffect, useRef, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

interface RTCPeerData {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export const useSpaceRTC = (spaceId: string) => {
  const session = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<{ userId: string; role: string }[]>([]);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerData>>(new Map());

  const connectToSpace = async () => {
    try {
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      // Connect to signaling server
      const wsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spaces-signaling?spaceId=${spaceId}&jwt=${session.access_token}`;
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('Connected to signaling server');
        setIsConnected(true);
      };

      websocketRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        handleSignalingMessage(message);
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      };

      websocketRef.current.onclose = () => {
        console.log('Disconnected from signaling server');
        setIsConnected(false);
      };

    } catch (err) {
      console.error('Error connecting to space:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSignalingMessage = async (message: any) => {
    try {
      switch (message.type) {
        case 'user-joined':
          setParticipants(prev => [...prev, { userId: message.userId, role: message.role }]);
          if (localStreamRef.current) {
            await initializePeerConnection(message.userId);
          }
          break;

        case 'user-left':
          setParticipants(prev => prev.filter(p => p.userId !== message.userId));
          cleanupPeerConnection(message.userId);
          break;

        case 'offer':
          await handleOffer(message);
          break;

        case 'answer':
          await handleAnswer(message);
          break;

        case 'ice-candidate':
          await handleIceCandidate(message);
          break;
      }
    } catch (err) {
      console.error('Error handling signaling message:', err);
    }
  };

  const initializePeerConnection = async (remoteUserId: string) => {
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

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendSignalingMessage({
      type: 'offer',
      offer,
      to: remoteUserId
    });
  };

  const handleOffer = async (message: any) => {
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

  const handleAnswer = async (message: any) => {
    const peer = peersRef.current.get(message.from);
    if (peer) {
      await peer.connection.setRemoteDescription(message.answer);
    }
  };

  const handleIceCandidate = async (message: any) => {
    const peer = peersRef.current.get(message.from);
    if (peer) {
      await peer.connection.addIceCandidate(message.candidate);
    }
  };

  const sendSignalingMessage = (message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      // Mute by default
      stream.getAudioTracks()[0].enabled = false;
      setIsMuted(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone');
    }
  };

  const cleanupPeerConnection = (userId: string) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.connection.close();
      peersRef.current.delete(userId);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    peersRef.current.forEach(peer => {
      peer.connection.close();
    });
    peersRef.current.clear();

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  useEffect(() => {
    if (spaceId && session) {
      connectToSpace();
      startAudio();
    }

    return cleanup;
  }, [spaceId, session]);

  return {
    isConnected,
    isMuted,
    error,
    participants,
    toggleMute,
    cleanup
  };
};