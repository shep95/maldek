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
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("App installed successfully!");
    });

    // Check if the browser supports installation
    const isInstallSupported = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS && !isSafari) {
        return false;
      }
      
      return 'serviceWorker' in navigator;
    };

    if (!isInstallSupported()) {
      console.log('Installation not supported on this browser/device');
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = async () => {
    console.log('Install button clicked');
    if (!deferredPrompt) {
      console.log('No installation prompt available');
      return;
    }

    try {
      // Show the install prompt
      const result = await deferredPrompt.prompt();
      console.log('Install prompt result:', result);
      
      // Reset the deferred prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
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
              disabled={!isInstallable}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isInstallable ? "Install App" : "Not Available"}
            </Button>

            {!isInstallable && (
              <p className="text-sm text-muted-foreground">
                To install Bosley, please use a supported browser like Chrome, Edge, or Safari. 
                If you're already using a supported browser, you might need to visit this page 
                directly (not in an iframe or private mode).
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};