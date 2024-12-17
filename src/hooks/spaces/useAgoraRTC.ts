import { useState, useEffect, useRef } from 'react';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { toast } from 'sonner';

const appId = ''; // We'll get this from Supabase secrets

export const useAgoraRTC = (channelName: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  useEffect(() => {
    const initializeAgora = async () => {
      try {
        // Create Agora client
        clientRef.current = AgoraRTC.createClient({ 
          mode: 'rtc',
          codec: 'vp8'
        });

        // Initialize audio track - Fix for the TypeScript error
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        audioTrackRef.current = audioTrack;
        audioTrack.setEnabled(false); // Start muted

        console.log('Agora client initialized');
      } catch (err) {
        console.error('Error initializing Agora:', err);
        setError('Failed to initialize audio system');
        toast.error('Failed to initialize audio system');
      }
    };

    initializeAgora();

    return () => {
      cleanup();
    };
  }, []);

  const joinChannel = async (uid: string) => {
    if (!clientRef.current || !audioTrackRef.current) {
      console.error('Agora client not initialized');
      return;
    }

    try {
      // Join the channel
      const token = null; // For testing only. In production, get token from server
      await clientRef.current.join(appId, channelName, token, uid);
      
      // Publish audio track
      await clientRef.current.publish(audioTrackRef.current);
      
      setIsConnected(true);
      console.log('Successfully joined channel:', channelName);
      toast.success('Connected to space');
    } catch (err) {
      console.error('Error joining channel:', err);
      setError('Failed to join audio channel');
      toast.error('Failed to join audio channel');
    }
  };

  const leaveChannel = async () => {
    if (!clientRef.current) return;

    try {
      // Unpublish and leave
      if (audioTrackRef.current) {
        await clientRef.current.unpublish(audioTrackRef.current);
      }
      await clientRef.current.leave();
      
      setIsConnected(false);
      console.log('Left channel:', channelName);
    } catch (err) {
      console.error('Error leaving channel:', err);
      toast.error('Error leaving channel');
    }
  };

  const toggleMute = () => {
    if (!audioTrackRef.current) return;
    
    try {
      const newMutedState = !isMuted;
      audioTrackRef.current.setEnabled(!newMutedState);
      setIsMuted(newMutedState);
      console.log(`Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
      toast.success(`Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
    } catch (err) {
      console.error('Error toggling mute:', err);
      toast.error('Failed to toggle microphone');
    }
  };

  const cleanup = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current.close();
    }
    if (clientRef.current) {
      clientRef.current.leave();
    }
    setIsConnected(false);
    setIsMuted(true);
    setError(null);
  };

  return {
    isConnected,
    isMuted,
    error,
    joinChannel,
    leaveChannel,
    toggleMute,
    cleanup
  };
};