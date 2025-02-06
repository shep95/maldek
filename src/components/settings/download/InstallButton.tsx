
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DownloadProgress } from "@/components/spaces/recording/DownloadProgress";
import { supabase } from "@/integrations/supabase/client";

interface InstallButtonProps {
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
}

export const InstallButton = ({ deferredPrompt, setDeferredPrompt }: InstallButtonProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentVersion = async () => {
      const platform = /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 
                      /Android/.test(navigator.userAgent) ? 'android' : 'web';
      
      const { data, error } = await supabase
        .from('app_versions')
        .select('version')
        .eq('platform', platform)
        .eq('is_latest', true)
        .single();

      if (!error && data) {
        setCurrentVersion(data.version);
      }
    };

    fetchCurrentVersion();
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

      // Get the latest version for the platform
      const { data: versionData, error: versionError } = await supabase
        .from('app_versions')
        .select('*')
        .eq('platform', platform)
        .eq('is_latest', true)
        .single();

      if (versionError || !versionData) {
        throw new Error('Could not find latest version');
      }

      // Start download progress animation
      simulateProgress();

      // Get the app build from storage
      const { data, error } = await supabase.storage
        .from('app_builds')
        .download(versionData.file_path);

      if (error) {
        throw error;
      }

      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = platform === 'ios' ? 'bosley.ipa' : 'bosley.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        description: platform === 'ios' 
          ? "Download complete! Follow your device's prompts to install Bosley."
          : "Download complete! Open the APK file to install Bosley.",
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
