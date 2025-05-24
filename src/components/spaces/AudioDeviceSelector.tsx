
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mic, Volume2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioDevices } from "@/hooks/spaces/useAudioDevices";
import { Separator } from "@/components/ui/separator";

interface AudioDeviceSelectorProps {
  onDeviceChange?: (inputDevice: string, outputDevice: string) => void;
}

export const AudioDeviceSelector = ({ onDeviceChange }: AudioDeviceSelectorProps) => {
  const {
    audioInputDevices,
    audioOutputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    isLoading,
    changeInputDevice,
    changeOutputDevice,
    refreshDevices
  } = useAudioDevices();

  const handleInputChange = (deviceId: string) => {
    changeInputDevice(deviceId);
    onDeviceChange?.(deviceId, selectedOutputDevice);
  };

  const handleOutputChange = (deviceId: string) => {
    changeOutputDevice(deviceId);
    onDeviceChange?.(selectedInputDevice, deviceId);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading audio devices...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Audio Settings</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshDevices}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1">
            <Mic className="h-3 w-3" />
            Microphone
          </Label>
          <Select value={selectedInputDevice} onValueChange={handleInputChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent>
              {audioInputDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId} className="text-xs">
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            Speakers
          </Label>
          <Select value={selectedOutputDevice} onValueChange={handleOutputChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select speakers" />
            </SelectTrigger>
            <SelectContent>
              {audioOutputDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId} className="text-xs">
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
