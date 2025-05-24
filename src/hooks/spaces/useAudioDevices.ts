
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export const useAudioDevices = () => {
  const [audioInputDevices, setAudioInputDevices] = useState<AudioDevice[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('default');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  const getAudioDevices = async () => {
    try {
      console.log('Requesting microphone permission...');
      
      // Request permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      
      // Stop the stream immediately as we only needed it for permissions
      stream.getTracks().forEach(track => track.stop());
      
      console.log('Permission granted, enumerating devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const inputDevices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
          kind: 'audioinput' as const
        }));

      const outputDevices = devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 5)}`,
          kind: 'audiooutput' as const
        }));

      console.log('Found devices:', { inputDevices, outputDevices });

      setAudioInputDevices(inputDevices);
      setAudioOutputDevices(outputDevices);
      
      // Set default devices if none selected and devices are available
      if (inputDevices.length > 0 && selectedInputDevice === 'default') {
        setSelectedInputDevice(inputDevices[0].deviceId);
      }
      if (outputDevices.length > 0 && selectedOutputDevice === 'default') {
        setSelectedOutputDevice(outputDevices[0].deviceId);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting audio devices:', error);
      setHasPermission(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Microphone permission denied. Please allow access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No microphone found. Please check your device connections.');
        } else {
          toast.error('Failed to access audio devices. Please check your permissions.');
        }
      }
      
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAudioDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      console.log('Audio devices changed, refreshing...');
      getAudioDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  // Load saved preferences on mount
  useEffect(() => {
    const savedInput = localStorage.getItem('preferredAudioInput');
    const savedOutput = localStorage.getItem('preferredAudioOutput');
    
    if (savedInput) setSelectedInputDevice(savedInput);
    if (savedOutput) setSelectedOutputDevice(savedOutput);
  }, []);

  const changeInputDevice = (deviceId: string) => {
    console.log('Changing input device to:', deviceId);
    setSelectedInputDevice(deviceId);
    localStorage.setItem('preferredAudioInput', deviceId);
  };

  const changeOutputDevice = (deviceId: string) => {
    console.log('Changing output device to:', deviceId);
    setSelectedOutputDevice(deviceId);
    localStorage.setItem('preferredAudioOutput', deviceId);
    
    // Apply to all audio elements on the page
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if ('setSinkId' in audio) {
        (audio as any).setSinkId(deviceId).catch((err: any) => {
          console.error('Error setting audio output device:', err);
        });
      }
    });
  };

  return {
    audioInputDevices,
    audioOutputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    isLoading,
    hasPermission,
    changeInputDevice,
    changeOutputDevice,
    refreshDevices: getAudioDevices
  };
};
