import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Laptop, Tablet, Menu } from "lucide-react";
import { toast } from "sonner";

export const DownloadSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
      setIsInstalled(true);
      return;
    }

    // Check if using Chrome
    const isChromeBrowser = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    setIsChrome(isChromeBrowser);

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
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
    console.log('Install button clicked', { deferredPrompt, isInstallable });
    
    if (!deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        toast.info("To install on iOS: Tap the share button (📤) at the bottom of your screen and select 'Add to Home Screen'");
      } else if (isAndroid && !isChrome) {
        toast.info("Please use Chrome browser for the best installation experience");
      } else if (isChrome) {
        toast.info("Click the menu (⋮) in Chrome and select 'Install Bosley'");
      } else {
        toast.info("Use your browser's menu to install the app. Look for 'Install' or 'Add to Home Screen' option");
      }
      return;
    }

    try {
      const promptResult = await deferredPrompt.prompt();
      console.log('Install prompt result:', promptResult);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error("Installation failed. Please try using your browser's menu to install.");
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
              <p>
                {isChrome ? (
                  <>
                    <Menu className="inline-block w-4 h-4 mr-1 mb-1" />
                    Click the menu button in Chrome and select "Install Bosley"
                  </>
                ) : /iPad|iPhone|iPod/.test(navigator.userAgent) ? (
                  "Tap the share button (📤) and select 'Add to Home Screen'"
                ) : (
                  "Use your browser's menu to install Bosley. Look for 'Install' or 'Add to Home Screen'"
                )}
              </p>
              <p className="text-xs">
                For the best experience, we recommend using Chrome on desktop or Android devices.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};