import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Laptop, Tablet } from "lucide-react";
import { toast } from "sonner";

export const DownloadSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("App installed successfully!");
    });

    // Initial check for installation support
    const checkInstallSupport = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const hasServiceWorker = 'serviceWorker' in navigator;
      const isSecure = window.location.protocol === 'https:';
      const hasManifest = !!document.querySelector('link[rel="manifest"]');

      console.log('Installation support check:', {
        isStandalone,
        hasServiceWorker,
        isSecure,
        hasManifest
      });

      return hasServiceWorker && (isSecure || window.location.hostname === 'localhost');
    };

    const isSupported = checkInstallSupport();
    setIsInstallable(isSupported);
    
    if (!isSupported) {
      console.log('Installation not supported on this browser/device');
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = async () => {
    console.log('Install button clicked', { deferredPrompt, isInstallable });
    
    if (!deferredPrompt) {
      // If no prompt but installable, guide the user
      if (isInstallable) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          toast.info("To install on iOS: tap the share button and select 'Add to Home Screen'");
        } else {
          toast.info("Use your browser's menu to install the app");
        }
      } else {
        toast.error("Installation not supported on this browser");
      }
      return;
    }

    try {
      // Show the install prompt
      const promptResult = await deferredPrompt.prompt();
      console.log('Install prompt result:', promptResult);
      
      // Reset the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error("Failed to install app. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download App</CardTitle>
        <CardDescription>Install Bosley on your devices for a better experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isInstalled ? (
          <div className="text-muted-foreground">
            Bosley is already installed on this device!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-muted">
                <Smartphone className="h-8 w-8 text-accent" />
                <span className="text-sm font-medium">Mobile</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-muted">
                <Laptop className="h-8 w-8 text-accent" />
                <span className="text-sm font-medium">Desktop</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-muted">
                <Tablet className="h-8 w-8 text-accent" />
                <span className="text-sm font-medium">Tablet</span>
              </div>
            </div>

            <Button
              onClick={handleInstall}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>

            <p className="text-sm text-muted-foreground">
              {!isInstallable ? (
                "To install Bosley, please use a supported browser like Chrome, Edge, or Safari on a desktop or Android device. iOS users should use Safari."
              ) : !deferredPrompt ? (
                "You can install Bosley using your browser's menu or the share button (iOS)"
              ) : (
                "Click the Install button above to add Bosley to your device"
              )}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};