import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RecordingStatus } from "./recording/RecordingStatus";
import { RecordingPurchaseDialog } from "./recording/RecordingPurchaseDialog";
import { DownloadProgress } from "./recording/DownloadProgress";

interface SpaceHistoryCardProps {
  space: any;
  onPurchaseComplete?: () => void;
  onPurchaseRecording?: (spaceId: string) => Promise<void>;  // Added this prop
  currentUserId?: string;  // Added this prop for consistency
}

export const SpaceHistoryCard = ({ 
  space, 
  onPurchaseComplete,
  onPurchaseRecording,
  currentUserId 
}: SpaceHistoryCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const { data: purchases } = await supabase
        .from('space_recording_purchases')
        .select('*')
        .eq('space_id', space.id)
        .eq('user_id', currentUserId)
        .eq('status', 'completed')
        .single();

      if (!purchases) {
        if (onPurchaseRecording) {
          await onPurchaseRecording(space.id);
        } else {
          setShowPurchaseDialog(true);
        }
        return;
      }

      if (!space.recording_url) {
        toast.error("Recording not available yet");
        return;
      }

      const response = await fetch(space.recording_url);
      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength || '0', 10);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to start download");

      let receivedLength = 0;
      const chunks = [];

      while(true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        const progress = (receivedLength / total) * 100;
        setDownloadProgress(progress);
      }

      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${space.title}-recording.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Download completed!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download recording");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handlePurchase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to purchase recordings");
        return;
      }

      const { error } = await supabase.functions.invoke('create-recording-payment', {
        body: { 
          spaceId: space.id,
          userId: user.id
        }
      });

      if (error) throw error;

      setShowPurchaseDialog(false);
      toast.success("Purchase successful!");
      onPurchaseComplete?.();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Failed to process purchase");
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{space.title}</h3>
        <RecordingStatus 
          isRecording={space.status === 'live'} 
          startTime={space.started_at} 
        />
      </div>

      {isDownloading ? (
        <DownloadProgress progress={downloadProgress} />
      ) : (
        <Button 
          onClick={handleDownload}
          disabled={!space.recording_url || isDownloading}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Recording
        </Button>
      )}

      <RecordingPurchaseDialog
        isOpen={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
        space={space}
        onPurchase={handlePurchase}
      />
    </Card>
  );
};