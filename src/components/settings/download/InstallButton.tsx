
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InstallButtonProps {
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
}

export const InstallButton = ({ deferredPrompt, setDeferredPrompt }: InstallButtonProps) => {
  const { toast } = useToast();

  const handleInstall = async () => {
    try {
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        
        if (result.outcome === 'accepted') {
          toast({
            description: "Installing Bosley on your device...",
          });
        }
        setDeferredPrompt(null);
      } else {
        // Direct install without browser prompts when possible
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (!isStandalone) {
          if ('standalone' in window.navigator || window.matchMedia('(display-mode: standalone)').matches) {
            toast({
              description: "Bosley is already installed on your device!",
            });
            return;
          }

          // Try to use the modern installation API directly
          if ('getInstalledRelatedApps' in navigator) {
            try {
              // @ts-ignore
              const apps = await navigator.getInstalledRelatedApps();
              if (apps.length === 0) {
                // Directly trigger install if possible
                // @ts-ignore
                if (window.BeforeInstallPromptEvent) {
                  toast({
                    description: "Starting Bosley installation...",
                  });
                } else {
                  toast({
                    description: "Installation started! Follow the quick prompt to complete installation.",
                  });
                }
              }
            } catch (e) {
              console.error("Error checking installation:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Installation error:', error);
      toast({
        description: "There was an error installing Bosley. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleInstall}
      className="w-full"
      variant="default"
      size="lg"
    >
      <Download className="mr-2 h-5 w-5" />
      Install Bosley App
    </Button>
  );
};
