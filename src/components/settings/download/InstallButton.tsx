import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface InstallButtonProps {
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
}

export const InstallButton = ({ deferredPrompt, setDeferredPrompt }: InstallButtonProps) => {
  const handleInstall = async () => {
    console.log("🔄 Install button clicked");
    console.log("Current deferredPrompt state:", deferredPrompt ? "Available" : "Not available");
    
    if (!deferredPrompt) {
      console.log("❌ No installation prompt available");
      
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      console.log("Browser check - Chrome:", isChrome);
      
      const isHttps = window.location.protocol === 'https:';
      console.log("Protocol check - HTTPS:", isHttps);
      
      let errorMessage = "Installation is not available. ";
      if (!isChrome) {
        errorMessage += "Please use Chrome browser. ";
      }
      if (!isHttps) {
        errorMessage += "HTTPS is required. ";
      }
      
      toast({
        title: "Installation Not Available",
        description: errorMessage,
        variant: "destructive"
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
          title: "Installing Bosley",
          description: "The app is being installed on your device.",
        });
      } else {
        toast({
          title: "Installation Cancelled",
          description: "You can install Bosley anytime by clicking the install button again.",
        });
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Error installing app:', error);
      toast({
        title: "Installation Failed",
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