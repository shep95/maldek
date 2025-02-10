
import { cn } from "@/lib/utils";

interface StoryRingProps {
  hasUnviewedStory: boolean;
  className?: string;
  children: React.ReactNode;
}

export const StoryRing = ({ hasUnviewedStory, className, children }: StoryRingProps) => {
  return (
    <div className={cn(
      "relative rounded-full",
      hasUnviewedStory && "p-[3px] bg-gradient-to-br from-[#F97316] to-white",
      className
    )}>
      <div className="bg-background rounded-full">
        {children}
      </div>
    </div>
  );
};
