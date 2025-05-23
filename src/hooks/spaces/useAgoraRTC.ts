
import { useState, useEffect, useRef } from 'react';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useAgoraRTC = (channelName: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  useEffect(() => {
    const fetchAppId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-agora-credentials');
        if (error) throw error;
        if (data.appId) {
          console.log('Successfully fetched Agora credentials');
          setAppId(data.appId);
        }
      } catch (err) {
        console.error('Error fetching Agora credentials:', err);
        setError('Failed to initialize audio system');
        toast.error('Failed to initialize audio system');
      }
    };

    fetchAppId();
  }, []);

  useEffect(() => {
    if (!appId) return;

    const initializeAgora = async () => {
      try {
        // Create Agora client
        clientRef.current = AgoraRTC.createClient({ 
          mode: 'rtc',
          codec: 'vp8'
        });

        // Initialize audio track
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
  }, [appId]);

  const joinChannel = async (uid: string) => {
    if (!clientRef.current || !audioTrackRef.current || !appId) {
      console.error('Agora client not initialized');
      return;
    }

    try {
      // Join the channel
      await clientRef.current.join(appId, channelName, null, uid);
      
      // Enable the track before publishing
      if (isMuted) {
        // If we're muted, we still need to enable the track for publishing
        // but we'll mute it right after publishing
        audioTrackRef.current.setEnabled(true);
      }
      
      // Publish audio track
      await clientRef.current.publish(audioTrackRef.current);
      
      // If user is muted, disable the track after publishing
      if (isMuted) {
        audioTrackRef.current.setEnabled(false);
      }
      
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
