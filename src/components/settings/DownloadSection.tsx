import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Laptop, Tablet, Share2, MoreVertical, Plus } from "lucide-react";
import { toast } from "sonner";

export const DownloadSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [browser, setBrowser] = useState<'chrome' | 'safari' | 'other'>('other');

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect browser
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    setBrowser(isChrome ? 'chrome' : isSafari ? 'safari' : 'other');

    // Detect device type
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet/.test(navigator.userAgent);
    const isMobile = /iPhone|Android.*Mobile|Mobile/.test(navigator.userAgent);
    setDeviceType(isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop');

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("App installed successfully!");
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        if (result.outcome === 'accepted') {
          toast.success("Installation started!");
        }
      } catch (error) {
        showInstallInstructions();
      }
    } else {
      showInstallInstructions();
    }
  };

  const showInstallInstructions = () => {
    if (deviceType === 'desktop') {
      if (browser === 'chrome') {
        toast.info(
          <div className="space-y-2">
            <p>To install on Chrome/Edge:</p>
            <p>1. Look for the install icon <Plus className="inline h-4 w-4" /> in the address bar</p>
            <p>2. Or click the menu <MoreVertical className="inline h-4 w-4" /> and select "Install Bosley"</p>
          </div>
        );
      } else {
        toast.info("Please use Chrome or Edge browser for the best installation experience");
      }
    } else if (deviceType === 'tablet') {
      if (browser === 'safari') {
        toast.info(
          <div className="space-y-2">
            <p>To install on iPad:</p>
            <p>1. Tap the share button <Share2 className="inline h-4 w-4" /></p>
            <p>2. Select "Add to Home Screen"</p>
          </div>
        );
      } else if (browser === 'chrome') {
        toast.info(
          <div className="space-y-2">
            <p>To install on Android tablet:</p>
            <p>1. Tap the menu <MoreVertical className="inline h-4 w-4" /></p>
            <p>2. Select "Install app" or "Add to Home Screen"</p>
          </div>
        );
      }
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
              variant="default"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="flex items-center gap-2">
                {deviceType === 'desktop' ? (
                  <>Look for the install icon <Plus className="h-4 w-4" /> in your browser's address bar</>
                ) : browser === 'safari' ? (
                  <>Tap the share button <Share2 className="h-4 w-4" /> and select "Add to Home Screen"</>
                ) : (
                  <>Tap the menu <MoreVertical className="h-4 w-4" /> and select "Install app"</>
                )}
              </p>
              <p className="text-xs">
                For the best experience, we recommend using Chrome on desktop or tablet devices.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};