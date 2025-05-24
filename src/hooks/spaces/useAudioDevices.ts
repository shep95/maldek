
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

  const getAudioDevices = async () => {
    try {
      // Request permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
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

      setAudioInputDevices(inputDevices);
      setAudioOutputDevices(outputDevices);
      
      // Set default devices if none selected
      if (inputDevices.length > 0 && selectedInputDevice === 'default') {
        setSelectedInputDevice(inputDevices[0].deviceId);
      }
      if (outputDevices.length > 0 && selectedOutputDevice === 'default') {
        setSelectedOutputDevice(outputDevices[0].deviceId);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting audio devices:', error);
      toast.error('Failed to get audio devices. Please check your permissions.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAudioDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      getAudioDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  const changeInputDevice = (deviceId: string) => {
    setSelectedInputDevice(deviceId);
    localStorage.setItem('preferredAudioInput', deviceId);
  };

  const changeOutputDevice = (deviceId: string) => {
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

  useEffect(() => {
    // Load saved preferences
    const savedInput = localStorage.getItem('preferredAudioInput');
    const savedOutput = localStorage.getItem('preferredAudioOutput');
    
    if (savedInput) setSelectedInputDevice(savedInput);
    if (savedOutput) setSelectedOutputDevice(savedOutput);
  }, []);

  return {
    audioInputDevices,
    audioOutputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    isLoading,
    changeInputDevice,
    changeOutputDevice,
    refreshDevices: getAudioDevices
  };
};
