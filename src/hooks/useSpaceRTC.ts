import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useSpaceSignaling } from './spaces/useSpaceSignaling';
import { usePeerConnections } from './spaces/usePeerConnections';
import { useAudioStream } from './spaces/useAudioStream';
import { Participant } from './spaces/types';

export const useSpaceRTC = (spaceId: string) => {
  const session = useSession();
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const {
    isConnected,
    error: signalingError,
    websocketRef,
    connectToSignalingServer,
    sendSignalingMessage,
    cleanup: cleanupSignaling
  } = useSpaceSignaling(spaceId);

  const {
    peersRef,
    localStreamRef,
    initializePeerConnection,
    handleOffer,
    cleanupPeerConnections
  } = usePeerConnections();

  const {
    isMuted,
    error: audioError,
    startAudio,
    toggleMute
  } = useAudioStream();

  const handleSignalingMessage = async (event: MessageEvent) => {
    const message = JSON.parse(event.data);
    try {
      switch (message.type) {
        case 'user-joined':
          setParticipants(prev => [...prev, { userId: message.userId, role: message.role }]);
          if (localStreamRef.current) {
            await initializePeerConnection(message.userId, sendSignalingMessage);
          }
          break;

        case 'user-left':
          setParticipants(prev => prev.filter(p => p.userId !== message.userId));
          const peer = peersRef.current.get(message.userId);
          if (peer) {
            peer.connection.close();
            peersRef.current.delete(message.userId);
          }
          break;

        case 'offer':
          await handleOffer(message, sendSignalingMessage);
          break;

        case 'answer':
          const answerPeer = peersRef.current.get(message.from);
          if (answerPeer) {
            await answerPeer.connection.setRemoteDescription(message.answer);
          }
          break;

        case 'ice-candidate':
          const candidatePeer = peersRef.current.get(message.from);
          if (candidatePeer) {
            await candidatePeer.connection.addIceCandidate(message.candidate);
          }
          break;
      }
    } catch (err) {
      console.error('Error handling signaling message:', err);
    }
  };

  useEffect(() => {
    if (spaceId && session) {
      connectToSignalingServer();
      startAudio().then(stream => {
        if (stream) {
          localStreamRef.current = stream;
        }
      });

      if (websocketRef.current) {
        websocketRef.current.onmessage = handleSignalingMessage;
      }
    }

    return () => {
      cleanupSignaling();
      cleanupPeerConnections();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [spaceId, session]);

  return {
    isConnected,
    isMuted,
    error: signalingError || audioError,
    participants,
    toggleMute: () => toggleMute(localStreamRef.current),
    cleanup: () => {
      cleanupSignaling();
      cleanupPeerConnections();
    }
  };
};