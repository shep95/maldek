import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { RecordingPurchaseDialog } from "./recording/RecordingPurchaseDialog";
import { DownloadProgress } from "./recording/DownloadProgress";

interface SpaceHistoryCardProps {
  space: any;
  onPurchaseRecording: (spaceId: string) => void;
  currentUserId: string | undefined;
}

export const SpaceHistoryCard = ({ space, onPurchaseRecording, currentUserId }: SpaceHistoryCardProps) => {
  const session = useSession();
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const downloadRecording = async (url: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(url);
      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get('Content-Length'));
      
      let receivedLength = 0;
      const chunks = [];

      while(true && reader) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        setDownloadProgress((receivedLength / contentLength) * 100);
      }

      const blob = new Blob(chunks);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${space.title}-recording.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      toast.success("Download completed!");
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDownload = async () => {
    try {
      console.log('Initiating recording download process for space:', space.id);
      
      const { data: purchases, error: purchaseError } = await supabase
        .from('space_recording_purchases')
        .select('*')
        .eq('space_id', space.id)
        .eq('user_id', session?.user?.id)
        .eq('status', 'completed')
        .single();

      if (purchaseError) {
        console.error('Error checking purchase status:', purchaseError);
        throw new Error('Failed to verify purchase status');
      }

      if (purchases) {
        console.log('Recording already purchased, initiating download');
        if (space.recording_url) {
          await downloadRecording(space.recording_url);
        } else {
          toast.error("Recording not available");
        }
      } else {
        console.log('Recording not purchased, initiating purchase flow');
        setIsPurchaseDialogOpen(true);
      }
    } catch (error) {
      console.error('Error handling recording:', error);
      toast.error("Failed to process recording. Please try again.");
    }
  };

  const handlePurchase = () => {
    setIsPurchaseDialogOpen(false);
    onPurchaseRecording(space.id);
  };

  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{space.title}</h3>
            {space.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {space.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Ended {formatDate(space.ended_at)}
            </p>
          </div>
          {space.recording_url && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleDownload}
              className="gap-2"
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              Purchase Recording (${space.recording_price?.toFixed(2) || "2.00"})
            </Button>
          )}
        </div>

        <DownloadProgress progress={downloadProgress} isDownloading={isDownloading} />

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={space.host?.avatar_url} />
            <AvatarFallback>
              {space.host?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {space.host?.username}
            </span>
            <span className="text-xs text-muted-foreground">Host</span>
          </div>
        </div>

        {space.participants && space.participants.length > 0 && (
          <ScrollArea className="h-20">
            <div className="flex flex-wrap gap-2">
              {space.participants
                .filter((p: any) => p.user_id !== space.host_id)
                .map((participant: any) => (
                  <div key={participant.user_id} className="flex items-center gap-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participant.profile?.avatar_url} />
                      <AvatarFallback>
                        {participant.profile?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground capitalize">
                      {participant.role}
                    </span>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{space.participants?.length || 0} participants</span>
        </div>
      </div>

      <RecordingPurchaseDialog
        isOpen={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
        space={space}
        onPurchase={handlePurchase}
      />
    </div>
  );
};