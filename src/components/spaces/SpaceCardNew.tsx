
import { Headphones, Heart, Mic, Music, Users } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface SpaceCardNewProps {
  title: string;
  description: string;
  hostName: string;
  listenerCount: number;
  iconType: "music" | "mic" | "heart" | "headphones";
  onClick: () => void;
}

export const SpaceCardNew = ({
  title,
  description,
  hostName,
  listenerCount,
  iconType = "mic",
  onClick
}: SpaceCardNewProps) => {
  // Map icon type to the appropriate component
  const getIcon = () => {
    switch (iconType) {
      case "music":
        return <Music className="h-5 w-5 text-white" />;
      case "heart":
        return <Heart className="h-5 w-5 text-white" />;
      case "headphones":
        return <Headphones className="h-5 w-5 text-white" />;
      case "mic":
      default:
        return <Mic className="h-5 w-5 text-white" />;
    }
  };

  return (
    <div className="w-full bg-[#1A1F2C] rounded-[20px] p-4 shadow-lg flex items-center gap-4 transition-all hover:shadow-xl hover:bg-[#222532]">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-gradient-to-br from-[#F97316] to-[#F59E0B] rounded-full flex items-center justify-center">
          {getIcon()}
        </div>
      </div>

      <div className="flex-grow min-w-0 mr-4">
        <h3 className="font-bold text-white text-lg leading-tight truncate">{title}</h3>
        <p className="text-gray-400 text-sm mb-1 line-clamp-1">{description}</p>
        <div className="flex items-center text-xs text-gray-500">
          <span>Hosted by {hostName}</span>
          <span className="mx-1">•</span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {listenerCount}
          </span>
        </div>
      </div>

      <Button
        onClick={onClick}
        className="flex-shrink-0 bg-gradient-to-r from-[#F97316] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#F97316] text-white min-w-[130px] rounded-xl font-medium"
      >
        Start Listening
      </Button>
    </div>
  );
};
