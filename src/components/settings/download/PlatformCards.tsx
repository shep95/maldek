
import { Smartphone, Laptop, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PlatformCards = () => {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const handleAndroidClick = () => {
    window.open('https://play.google.com/store/apps/details?id=com.tGBvxWwSLUzd.natively', '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-muted bg-card ${isAndroid ? 'hover:bg-accent/5 cursor-pointer' : ''} transition-colors`}
        onClick={isAndroid ? handleAndroidClick : undefined}
      >
        <Smartphone className="h-8 w-8 text-accent" />
        <span className="text-sm font-medium">
          {isAndroid ? (
            <Button 
              variant="link" 
              className="p-0 h-auto font-medium"
              onClick={handleAndroidClick}
            >
              Android App
            </Button>
          ) : isIOS ? 'iOS App' : 'Mobile App'}
        </span>
        <span className="text-xs text-muted-foreground text-center">
          {isAndroid ? 'Install from Google Play' : isIOS ? 'COMING SOON' : 'Available for Android • iOS Coming Soon'}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-muted bg-card hover:bg-accent/5 transition-colors">
        <Laptop className="h-8 w-8 text-accent" />
        <span className="text-sm font-medium">Desktop App</span>
        <span className="text-xs text-muted-foreground text-center">Install via browser prompt</span>
      </div>
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-muted bg-card hover:bg-accent/5 transition-colors">
        <Tablet className="h-8 w-8 text-accent" />
        <span className="text-sm font-medium">Tablet App</span>
        <span className="text-xs text-muted-foreground text-center">Download for your platform</span>
      </div>
    </div>
  );
};
