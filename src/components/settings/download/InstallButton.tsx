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
    console.log("🔄 Install button clicked");
    console.log("Current deferredPrompt state:", deferredPrompt ? "Available" : "Not available");
    
    if (!deferredPrompt) {
      console.log("❌ No installation prompt available");
      
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isHttps = window.location.protocol === 'https:';
      
      console.log("Browser check - Chrome:", isChrome, "Safari:", isSafari, "HTTPS:", isHttps);
      
      let errorMessage = "To install Bosley: ";
      
      if (isSafari && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        errorMessage += "Tap the share button and select 'Add to Home Screen'";
      } else if (!isChrome && !isSafari) {
        errorMessage += "Please use Chrome or Safari. ";
      } else if (!isHttps) {
        errorMessage += "HTTPS is required. ";
      } else {
        errorMessage += "Use your browser's menu to install the app";
      }
      
      toast({
        description: errorMessage,
      });
      return;
    }

    try {
      console.log("🚀 Triggering installation prompt");
      await deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      console.log("👤 User choice:", choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        toast({
          description: "Installing Bosley on your device...",
        });
      } else {
        toast({
          description: "You can install Bosley anytime by clicking the install button again.",
        });
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Error installing app:', error);
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