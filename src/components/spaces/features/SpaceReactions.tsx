import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ThumbsUp, Star, Smile } from "lucide-react";

interface SpaceReactionsProps {
  onReaction: (type: string) => void;
}

export const SpaceReactions = ({ onReaction }: SpaceReactionsProps) => {
  const [recentReactions, setRecentReactions] = useState<string[]>([]);

  const reactions = [
    { icon: Heart, label: "❤️" },
    { icon: ThumbsUp, label: "👍" },
    { icon: Star, label: "⭐" },
    { icon: Smile, label: "😊" }
  ];

  const handleReaction = (type: string) => {
    onReaction(type);
    setRecentReactions(prev => [...prev.slice(-4), type]);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {reactions.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10"
            onClick={() => handleReaction(label)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      {recentReactions.length > 0 && (
        <div className="text-sm text-muted-foreground animate-fade-up">
          Recent: {recentReactions.join(" ")}
        </div>
      )}
    </div>
  );
};