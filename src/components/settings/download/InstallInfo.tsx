import { AppWindow } from "lucide-react";

export const InstallInfo = () => {
  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <p className="flex items-center gap-2">
        <AppWindow className="h-4 w-4" />
        Install once, use everywhere - Your profile and data sync across all devices
      </p>
      <p className="text-xs">
        Bosley works offline and provides a native app experience on all your devices
      </p>
    </div>
  );
};