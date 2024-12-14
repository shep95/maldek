import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppWindow, Download, Laptop, Smartphone, Tablet } from "lucide-react";
import { useEffect, useState } from "react";

export const DownloadSection = () => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleInstall = () => {
    // Trigger Progressier install prompt
    if (window.progressier) {
      window.progressier.install();
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