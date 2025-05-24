
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSpace } from '@/contexts/SpaceContext';
import { RefreshCw, Mic, Volume2, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface SpaceSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpaceSettingsDialog = ({ isOpen, onOpenChange }: SpaceSettingsDialogProps) => {
  const {
    audioDevices,
    selectedAudioInput,
    selectedAudioOutput,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    refreshAudioDevices
  } = useSpace();

  const [inputVolume, setInputVolume] = useState([80]);
  const [outputVolume, setOutputVolume] = useState([80]);
  const [noiseSupression, setNoiseSupression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);

  const audioInputs = audioDevices.filter(device => device.kind === 'audioinput');
  const audioOutputs = audioDevices.filter(device => device.kind === 'audiooutput');

  const testMicrophone = async () => {
    setIsTestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedAudioInput ? { exact: selectedAudioInput } : undefined,
          echoCancellation,
          noiseSuppression: noiseSupression,
          autoGainControl
        }
      });

      // Create audio context for level detection
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      let maxLevel = 0;
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const level = Math.max(...dataArray);
        maxLevel = Math.max(maxLevel, level);
      };

      const interval = setInterval(checkLevel, 100);

      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        
        if (maxLevel > 50) {
          toast.success('Microphone is working! Detected audio input.');
        } else {
          toast.warning('Microphone detected but no audio input. Try speaking louder.');
        }
        setIsTestingMic(false);
      }, 3000);

      toast.info('Testing microphone... Please speak for 3 seconds.');
    } catch (error) {
      console.error('Microphone test failed:', error);
      toast.error('Failed to test microphone. Check device permissions.');
      setIsTestingMic(false);
    }
  };

  const testSpeakers = () => {
    const audio = new Audio('/test-audio.mp3'); // You'd need to add a test audio file
    if (selectedAudioOutput && 'setSinkId' in audio) {
      (audio as any).setSinkId(selectedAudioOutput);
    }
    audio.volume = outputVolume[0] / 100;
    audio.play().catch(() => {
      // Fallback - create a test tone
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(outputVolume[0] / 100 * 0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      toast.success('Playing test tone through selected output device.');
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Space Audio Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audio Devices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Audio Devices</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAudioDevices}
                className="gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Mic className="h-4 w-4" />
                  Microphone
                </Label>
                <Select value={selectedAudioInput} onValueChange={setSelectedAudioInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioInputs.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}...`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testMicrophone}
                    disabled={isTestingMic}
                    className="flex-1"
                  >
                    {isTestingMic ? 'Testing...' : 'Test Mic'}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4" />
                  Speakers
                </Label>
                <Select value={selectedAudioOutput} onValueChange={setSelectedAudioOutput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select speakers" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioOutputs.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 8)}...`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testSpeakers}
                  className="mt-2 w-full"
                >
                  Test Speakers
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Volume Controls */}
          <div className="space-y-4">
            <h4 className="font-medium">Volume Controls</h4>
            
            <div>
              <Label className="mb-2 block">
                Input Volume: {inputVolume[0]}%
              </Label>
              <Slider
                value={inputVolume}
                onValueChange={setInputVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 block">
                Output Volume: {outputVolume[0]}%
              </Label>
              <Slider
                value={outputVolume}
                onValueChange={setOutputVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Audio Processing */}
          <div className="space-y-4">
            <h4 className="font-medium">Audio Processing</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Noise Suppression</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduces background noise
                  </p>
                </div>
                <Switch checked={noiseSupression} onCheckedChange={setNoiseSupression} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Echo Cancellation</Label>
                  <p className="text-xs text-muted-foreground">
                    Prevents audio feedback
                  </p>
                </div>
                <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Gain Control</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically adjusts volume
                  </p>
                </div>
                <Switch checked={autoGainControl} onCheckedChange={setAutoGainControl} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push to Talk</Label>
                  <p className="text-xs text-muted-foreground">
                    Hold space bar to speak
                  </p>
                </div>
                <Switch checked={pushToTalk} onCheckedChange={setPushToTalk} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Device Info */}
          <div className="space-y-2">
            <h4 className="font-medium">Device Information</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Audio inputs detected: {audioInputs.length}</p>
              <p>Audio outputs detected: {audioOutputs.length}</p>
              <div className="flex gap-1 flex-wrap">
                {audioInputs.length === 0 && (
                  <Badge variant="destructive">No microphones</Badge>
                )}
                {audioOutputs.length === 0 && (
                  <Badge variant="destructive">No speakers</Badge>
                )}
                {audioInputs.length > 0 && audioOutputs.length > 0 && (
                  <Badge variant="secondary">Audio ready</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
