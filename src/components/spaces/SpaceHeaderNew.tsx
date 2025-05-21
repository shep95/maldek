
import { cn } from "@/lib/utils";

interface SpaceHeaderNewProps {
  className?: string;
}

export const SpaceHeaderNew = ({ className }: SpaceHeaderNewProps) => {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-3xl font-bold text-white">Spaces</h1>
      <div className="h-1 w-16 bg-[#F97316] mt-2 rounded-full" />
    </div>
  );
};
