
import { AppWindow, Shield } from "lucide-react";

export const InstallInfo = () => {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <p className="flex items-center gap-2">
        <AppWindow className="h-4 w-4" />
        Download and install Bosley directly on your device
      </p>
      {isAndroid && (
        <p className="flex items-center gap-2 text-xs">
          <Shield className="h-3 w-3" />
          You may need to allow installation from unknown sources in your device settings
        </p>
      )}
      {isIOS && (
        <p className="flex items-center gap-2 text-xs">
          <Shield className="h-3 w-3" />
          Follow your device's prompts to trust the developer certificate
        </p>
      )}
      <p className="text-xs">
        Bosley works offline and provides a native app experience on all your devices
      </p>
    </div>
  );
};
