import { AppWindow } from "lucide-react";

export const InstallationStatus = () => {
  return (
    <div className="flex items-center gap-2 text-green-500">
      <AppWindow className="h-5 w-5" />
      <span>Bosley is installed! Launch it from your device.</span>
    </div>
  );
};