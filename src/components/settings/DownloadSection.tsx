import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Laptop, Tablet, Share2, MoreVertical, Plus, AppWindow } from "lucide-react";
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
      toast.success("Bosley app installed successfully! You can now launch it from your device.");
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
          toast.success("Installing Bosley app...");
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
        toast(
          <div className="space-y-2">
            <p className="font-semibold">Install Bosley Desktop App:</p>
            <p>1. Look for the install icon <Plus className="inline h-4 w-4" /> in the address bar</p>
            <p>2. Or click the menu <MoreVertical className="inline h-4 w-4" /> and select "Install Bosley"</p>
            <p className="text-sm text-muted-foreground mt-2">Once installed, you can launch Bosley from your desktop like any other app!</p>
          </div>
        );
      } else {
        toast.info("For the best app experience, please use Chrome or Edge browser to install Bosley on your computer");
      }
    } else if (deviceType === 'mobile') {
      if (browser === 'safari') {
        toast(
          <div className="space-y-2">
            <p className="font-semibold">Install Bosley Mobile App:</p>
            <p>1. Tap the share button <Share2 className="inline h-4 w-4" /></p>
            <p>2. Select "Add to Home Screen"</p>
            <p className="text-sm text-muted-foreground mt-2">The app will appear on your home screen like any other app!</p>
          </div>
        );
      } else {
        toast(
          <div className="space-y-2">
            <p className="font-semibold">Install Bosley Mobile App:</p>
            <p>1. Tap the menu <MoreVertical className="inline h-4 w-4" /></p>
            <p>2. Select "Install app" or "Add to Home Screen"</p>
            <p className="text-sm text-muted-foreground mt-2">Launch Bosley from your home screen after installation!</p>
          </div>
        );
      }
    } else if (deviceType === 'tablet') {
      if (browser === 'safari') {
        toast(
          <div className="space-y-2">
            <p className="font-semibold">Install Bosley Tablet App:</p>
            <p>1. Tap the share button <Share2 className="inline h-4 w-4" /></p>
            <p>2. Select "Add to Home Screen"</p>
            <p className="text-sm text-muted-foreground mt-2">Enjoy Bosley as a full-screen tablet app!</p>
          </div>
        );
      } else {
        toast(
          <div className="space-y-2">
            <p className="font-semibold">Install Bosley Tablet App:</p>
            <p>1. Tap the menu <MoreVertical className="inline h-4 w-4" /></p>
            <p>2. Select "Install app" or "Add to Home Screen"</p>
            <p className="text-sm text-muted-foreground mt-2">Launch Bosley in full-screen mode after installation!</p>
          </div>
        );
      }
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