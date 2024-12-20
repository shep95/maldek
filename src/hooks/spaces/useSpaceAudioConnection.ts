import { useState, useEffect } from 'react';
import { useAgoraRTC } from './useAgoraRTC';
import { toast } from 'sonner';

export const useSpaceAudioConnection = (spaceId: string, userId: string) => {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;

  const {
    isConnected,
    isMuted,
    error: audioError,
    joinChannel,
    leaveChannel,
    toggleMute
  } = useAgoraRTC(spaceId);

  useEffect(() => {
    if (audioError && reconnectAttempts < maxReconnectAttempts) {
      console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
      setIsReconnecting(true);
      
      const reconnectTimer = setTimeout(async () => {
        try {
          await leaveChannel();
          await joinChannel(userId);
          setIsReconnecting(false);
          setReconnectAttempts(0);
          toast.success('Reconnected to audio');
        } catch (err) {
          console.error('Reconnection failed:', err);
          setReconnectAttempts(prev => prev + 1);
          if (reconnectAttempts + 1 >= maxReconnectAttempts) {
            toast.error('Unable to reconnect to audio. Please try rejoining the space.');
            setIsReconnecting(false);
          }
        }
      }, 2000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [audioError, reconnectAttempts, spaceId, userId]);

  const handleMuteToggle = () => {
    try {
      toggleMute();
      toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error('Failed to toggle microphone. Please check your permissions.');
    }
  };

  return {
    isConnected,
    isMuted,
    isReconnecting,
    audioError,
    handleMuteToggle,
    joinChannel,
    leaveChannel
  };
};