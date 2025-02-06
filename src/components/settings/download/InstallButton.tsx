
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DownloadProgress } from "@/components/spaces/recording/DownloadProgress";
import { supabase } from "@/integrations/supabase/client";
import { checkForUpdate } from "@/utils/appCenterConfig";

interface InstallButtonProps {
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
}

export const InstallButton = ({ deferredPrompt, setDeferredPrompt }: InstallButtonProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkUpdates = async () => {
      const latestVersion = await checkForUpdate();
      if (latestVersion) {
        setCurrentVersion(latestVersion.version);
        setDownloadUrl(latestVersion.download_url);
      }
    };

    checkUpdates();
  }, []);

  const simulateProgress = () => {
    setIsDownloading(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setIsDownloading(false);
      setProgress(0);
    }, 5500);

    return interval;
  };

  const handleDownload = async () => {
    try {
      const platform = /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 
                      /Android/.test(navigator.userAgent) ? 'android' : 'web';
      
      if (platform === 'web') {
        if (deferredPrompt) {
          const progressInterval = simulateProgress();
          await deferredPrompt.prompt();
          const result = await deferredPrompt.userChoice;
          
          if (result.outcome === 'accepted') {
            toast({
              description: "Bosley has been installed on your device!",
            });
          } else {
            clearInterval(progressInterval);
            setIsDownloading(false);
            setProgress(0);
          }
          setDeferredPrompt(null);
        }
        return;
      }

      // If we have a download URL, use it
      if (downloadUrl) {
        simulateProgress();
        window.open(downloadUrl, '_blank');
        toast({
          description: `Opening ${platform === 'ios' ? 'iOS' : 'Android'} app download page...`,
        });
        return;
      }

      toast({
        description: "Download link not available. Please try again later.",
        variant: "destructive"
      });

    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setProgress(0);
      toast({
        description: "There was an error downloading the app. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleDownload}
        className="w-full"
        variant="default"
        size="lg"
        disabled={isDownloading}
      >
        <Download className="mr-2 h-5 w-5" />
        {isDownloading ? "Downloading..." : `Download Bosley App${currentVersion ? ` v${currentVersion}` : ''}`}
      </Button>
      
      {isDownloading && <DownloadProgress progress={progress} />}
    </div>
  );
};
