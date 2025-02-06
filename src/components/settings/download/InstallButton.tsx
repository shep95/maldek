
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DownloadProgress } from "@/components/spaces/recording/DownloadProgress";

interface InstallButtonProps {
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
}

export const InstallButton = ({ deferredPrompt, setDeferredPrompt }: InstallButtonProps) => {
  const { toast } = useToast();
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateProgress = () => {
    setIsInstalling(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Clear interval after completion
    setTimeout(() => {
      clearInterval(interval);
      setIsInstalling(false);
      setProgress(0);
    }, 5500);

    return interval;
  };

  const handleInstall = async () => {
    try {
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
          setIsInstalling(false);
          setProgress(0);
        }
        setDeferredPrompt(null);
      } else {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (!isStandalone) {
          if ('standalone' in window.navigator && window.navigator.standalone) {
            toast({
              description: "Bosley is already installed on your device!",
            });
            return;
          }

          // Try native installation flow
          const progressInterval = simulateProgress();
          
          if ('getInstalledRelatedApps' in navigator) {
            try {
              // @ts-ignore
              const apps = await navigator.getInstalledRelatedApps();
              if (apps.length === 0) {
                // Trigger install
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({
                    type: 'INSTALL_APP'
                  });
                  
                  // Listen for installation success
                  window.addEventListener('appinstalled', () => {
                    toast({
                      description: "Bosley has been installed successfully!",
                    });
                  });
                } else {
                  toast({
                    description: "Please follow your device's installation prompt to complete installation.",
                  });
                }
              }
            } catch (e) {
              console.error("Error checking installation:", e);
              clearInterval(progressInterval);
              setIsInstalling(false);
              setProgress(0);
              toast({
                description: "There was an error during installation. Please try again.",
                variant: "destructive"
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Installation error:', error);
      setIsInstalling(false);
      setProgress(0);
      toast({
        description: "There was an error installing Bosley. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleInstall}
        className="w-full"
        variant="default"
        size="lg"
        disabled={isInstalling}
      >
        <Download className="mr-2 h-5 w-5" />
        {isInstalling ? "Installing..." : "Install Bosley App"}
      </Button>
      
      {isInstalling && <DownloadProgress progress={progress} />}
    </div>
  );
};
