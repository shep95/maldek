import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppWindow, Download, Laptop, Smartphone, Tablet } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const DownloadSection = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Initializing installation checks...");
    
    // Check if app is already installed
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      console.log("Standalone mode check:", isStandalone);
      setIsInstalled(isStandalone);
    };

    checkInstallation();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener(checkInstallation);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log("📱 Received beforeinstallprompt event");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Check if the app can be installed
    const checkInstallability = async () => {
      if ('getInstalledRelatedApps' in navigator) {
        try {
          // @ts-ignore - TypeScript doesn't know about this API yet
          const relatedApps = await navigator.getInstalledRelatedApps();
          console.log("Related apps check:", relatedApps);
          if (relatedApps.length > 0) {
            setIsInstalled(true);
          }
        } catch (error) {
          console.log("Error checking related apps:", error);
        }
      }
    };

    checkInstallability();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log("✅ App installed successfully");
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast({
        title: "Installation Successful",
        description: "Bosley has been installed on your device!",
      });
    });

    return () => {
      mediaQuery.removeListener(checkInstallation);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  const handleInstall = async () => {
    console.log("🔄 Install button clicked");
    console.log("Current deferredPrompt state:", deferredPrompt ? "Available" : "Not available");
    
    if (!deferredPrompt) {
      console.log("❌ No installation prompt available");
      
      // Check if running in Chrome
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      console.log("Browser check - Chrome:", isChrome);
      
      // Check if on HTTPS
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AppWindow className="h-5 w-5" />
          Install Bosley App
        </CardTitle>
        <CardDescription>Get the native app experience on all your devices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isInstalled ? (
          <div className="flex items-center gap-2 text-green-500">
            <AppWindow className="h-5 w-5" />
            <span>Bosley is installed! Launch it from your device.</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-muted bg-card hover:bg-accent/5 transition-colors">
                <Smartphone className="h-8 w-8 text-accent" />
                <span className="text-sm font-medium">Mobile App</span>
                <span className="text-xs text-muted-foreground text-center">Launch from your home screen</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-muted bg-card hover:bg-accent/5 transition-colors">
                <Laptop className="h-8 w-8 text-accent" />
                <span className="text-sm font-medium">Desktop App</span>
                <span className="text-xs text-muted-foreground text-center">Use like any desktop application</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-muted bg-card hover:bg-accent/5 transition-colors">
                <Tablet className="h-8 w-8 text-accent" />
                <span className="text-sm font-medium">Tablet App</span>
                <span className="text-xs text-muted-foreground text-center">Full-screen tablet experience</span>
              </div>
            </div>

            <Button
              onClick={handleInstall}
              className="w-full"
              variant="default"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Install Bosley App
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="flex items-center gap-2">
                <AppWindow className="h-4 w-4" />
                Install once, use everywhere - Your profile and data sync across all devices
              </p>
              <p className="text-xs">
                Bosley works offline and provides a native app experience on all your devices
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};