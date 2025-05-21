
import { useEffect, useState, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useSpaceSignaling } from './spaces/useSpaceSignaling';
import { usePeerConnections } from './spaces/usePeerConnections';
import { useAudioStream } from './spaces/useAudioStream';
import { Participant } from './spaces/types';

export const useSpaceRTC = (spaceId: string) => {
  const session = useSession();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userRole, setUserRole] = useState<string>('listener');
  
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
    toggleMute,
    stopAudio,
    getStream
  } = useAudioStream();

  const handleSignalingMessage = async (event: MessageEvent) => {
    const message = JSON.parse(event.data);
    try {
      switch (message.type) {
        case 'user-joined':
          const newParticipant = { 
            userId: message.userId, 
            role: message.role,
            name: message.userName || 'Unknown User',
            image: message.userImage || ''
          };
          
          setParticipants(prev => {
            const exists = prev.some(p => p.userId === message.userId);
            if (exists) {
              return prev.map(p => p.userId === message.userId ? newParticipant : p);
            } else {
              return [...prev, newParticipant];
            }
          });
          
          // Only initiate peer connection if we're a speaker or host
          if (userRole === 'speaker' || userRole === 'host' || userRole === 'co_host') {
            if (localStreamRef.current) {
              await initializePeerConnection(message.userId, sendSignalingMessage);
            }
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
          
        case 'user-role-changed':
          setParticipants(prev => prev.map(p => {
            if (p.userId === message.userId) {
              return { ...p, role: message.newRole };
            }
            return p;
          }));
          
          // If this is about our role being changed
          if (message.userId === session?.user?.id) {
            setUserRole(message.newRole);
            
            // If our role was changed to speaker/host and we don't have an audio stream yet
            if ((message.newRole === 'speaker' || message.newRole === 'host' || message.newRole === 'co_host') 
                && !localStreamRef.current) {
              const stream = await startAudio();
              if (stream) {
                localStreamRef.current = stream;
                // Initialize connections with existing speakers/hosts
                for (const participant of participants) {
                  if (participant.role === 'speaker' || participant.role === 'host' || participant.role === 'co_host') {
                    await initializePeerConnection(participant.userId, sendSignalingMessage);
                  }
                }
              }
            } 
            // If our role was changed from speaker/host to listener
            else if (message.newRole === 'listener' && localStreamRef.current) {
              // Stop sending audio
              stopAudio();
              localStreamRef.current = null;
            }
          }
          break;

        case 'forced-mute':
          if (message.from !== session?.user?.id) {
            toggleMute();
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

  // Function to change another user's role (only for host)
  const changeUserRole = (userId: string, newRole: string) => {
    if (userRole === 'host' && userId !== session?.user?.id) {
      sendSignalingMessage({
        type: 'change-role',
        targetUserId: userId,
        newRole
      });
    }
  };

  // Function to mute another user (only for host or co-host)
  const muteUser = (userId: string) => {
    if ((userRole === 'host' || userRole === 'co_host') && userId !== session?.user?.id) {
      sendSignalingMessage({
        type: 'mute-user',
        targetUserId: userId
      });
    }
  };

  useEffect(() => {
    if (spaceId && session) {
      // Fetch user's current role
      const fetchUserRole = async () => {
        const { data, error } = await fetch(`/api/space-role?spaceId=${spaceId}&userId=${session.user.id}`)
          .then(res => res.json());
          
        if (error) {
          console.error('Error fetching user role:', error);
        } else if (data?.role) {
          setUserRole(data.role);
          return data.role;
        }
        
        return 'listener'; // Default role
      };
      
      fetchUserRole().then(async (role) => {
        connectToSignalingServer();
        
        // Only start audio if user is a speaker or host
        if (role === 'speaker' || role === 'host' || role === 'co_host') {
          const stream = await startAudio();
          if (stream) {
            localStreamRef.current = stream;
          }
        }
      });

      if (websocketRef.current) {
        websocketRef.current.onmessage = handleSignalingMessage;
      }
    }

    return () => {
      cleanupSignaling();
      cleanupPeerConnections();
      stopAudio();
    };
  }, [spaceId, session]);

  return {
    isConnected,
    isMuted,
    error: signalingError || audioError,
    participants,
    userRole,
    toggleMute,
    changeUserRole,
    muteUser,
    cleanup: () => {
      cleanupSignaling();
      cleanupPeerConnections();
      stopAudio();
    }
  };
};
