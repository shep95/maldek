
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppWindow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InstallationStatus } from "./download/InstallationStatus";
import { PlatformCards } from "./download/PlatformCards";
import { InstallButton } from "./download/InstallButton";
import { InstallInfo } from "./download/InstallInfo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
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
    
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isPWA = window.navigator.standalone || document.referrer.includes('android-app://');
      console.log("Installation check - Standalone:", isStandalone, "PWA:", isPWA);
      setIsInstalled(isStandalone || isPWA);
    };

    checkInstallation();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener(checkInstallation);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log("📱 Received beforeinstallprompt event");
      e.preventDefault();
      setDeferredPrompt(e);
    };

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

    window.addEventListener('appinstalled', () => {
      console.log("✅ App installed successfully");
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("Bosley has been installed on your device!");
    });

    return () => {
      mediaQuery.removeListener(checkInstallation);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

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
          <InstallationStatus />
        ) : (
          <>
            <PlatformCards />
            <InstallButton 
              deferredPrompt={deferredPrompt}
              setDeferredPrompt={setDeferredPrompt}
            />
            <InstallInfo />
          </>
        )}
      </CardContent>
    </Card>
  );
};
