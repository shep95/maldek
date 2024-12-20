import { Smartphone, Laptop, Tablet } from "lucide-react";

export const PlatformCards = () => {
  return (
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
  );
};