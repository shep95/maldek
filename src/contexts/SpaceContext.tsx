
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpaceContextType {
  currentSpace: any | null;
  isInSpace: boolean;
  audioDevices: MediaDeviceInfo[];
  selectedAudioInput: string;
  selectedAudioOutput: string;
  joinSpace: (spaceId: string) => Promise<void>;
  leaveSpace: () => Promise<void>;
  setSelectedAudioInput: (deviceId: string) => void;
  setSelectedAudioOutput: (deviceId: string) => void;
  refreshAudioDevices: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | null>(null);

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
};

export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useSession();
  const [currentSpace, setCurrentSpace] = useState<any | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');

  const refreshAudioDevices = async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      
      setAudioDevices([...audioInputs, ...audioOutputs]);
      
      // Set default devices if none selected
      if (!selectedAudioInput && audioInputs.length > 0) {
        setSelectedAudioInput(audioInputs[0].deviceId);
      }
      if (!selectedAudioOutput && audioOutputs.length > 0) {
        setSelectedAudioOutput(audioOutputs[0].deviceId);
      }
      
      console.log('Audio devices refreshed:', { audioInputs, audioOutputs });
    } catch (error) {
      console.error('Error enumerating audio devices:', error);
      toast.error('Failed to access audio devices. Please check permissions.');
    }
  };

  const joinSpace = async (spaceId: string) => {
    if (!session?.user) {
      toast.error('You must be logged in to join spaces');
      return;
    }

    try {
      // Fetch space details
      const { data: space, error: spaceError } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .single();

      if (spaceError) throw spaceError;

      // Check if already a participant
      const { data: existingParticipant } = await supabase
        .from('space_participants')
        .select('role')
        .eq('space_id', spaceId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!existingParticipant) {
        // Join as participant
        const { error: joinError } = await supabase
          .from('space_participants')
          .insert({
            space_id: spaceId,
            user_id: session.user.id,
            role: 'listener'
          });

        if (joinError) throw joinError;
      }

      setCurrentSpace(space);
      toast.success('Joined space successfully');
      
      // Store in localStorage for persistence
      localStorage.setItem('currentSpaceId', spaceId);
      
    } catch (error) {
      console.error('Error joining space:', error);
      toast.error('Failed to join space');
    }
  };

  const leaveSpace = async () => {
    if (!currentSpace || !session?.user) return;

    try {
      const { error } = await supabase
        .from('space_participants')
        .delete()
        .eq('space_id', currentSpace.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setCurrentSpace(null);
      localStorage.removeItem('currentSpaceId');
      toast.success('Left space successfully');
    } catch (error) {
      console.error('Error leaving space:', error);
      toast.error('Failed to leave space');
    }
  };

  // Restore space on app load
  useEffect(() => {
    const restoreSpace = async () => {
      const savedSpaceId = localStorage.getItem('currentSpaceId');
      if (savedSpaceId && session?.user) {
        // Verify we're still a participant
        const { data: participant } = await supabase
          .from('space_participants')
          .select('role')
          .eq('space_id', savedSpaceId)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (participant) {
          const { data: space } = await supabase
            .from('spaces')
            .select('*')
            .eq('id', savedSpaceId)
            .single();

          if (space && space.status === 'live') {
            setCurrentSpace(space);
          } else {
            localStorage.removeItem('currentSpaceId');
          }
        } else {
          localStorage.removeItem('currentSpaceId');
        }
      }
    };

    if (session?.user) {
      restoreSpace();
      refreshAudioDevices();
    }
  }, [session?.user]);

  // Listen for device changes
  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', refreshAudioDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refreshAudioDevices);
    };
  }, []);

  return (
    <SpaceContext.Provider
      value={{
        currentSpace,
        isInSpace: !!currentSpace,
        audioDevices,
        selectedAudioInput,
        selectedAudioOutput,
        joinSpace,
        leaveSpace,
        setSelectedAudioInput,
        setSelectedAudioOutput,
        refreshAudioDevices
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};
