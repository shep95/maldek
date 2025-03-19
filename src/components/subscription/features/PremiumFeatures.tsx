
import { Image, Sparkles, FolderLock, Crown, Play, BarChart2 } from "lucide-react";
import { FeatureItem } from "./FeatureItem";

export const PremiumFeatures = () => {
  return (
    <>
      <FeatureItem
        icon={Image}
        text="GIF Upload Support"
        iconColor="text-accent"
      />
      <FeatureItem
        icon={Sparkles}
        text="Animated Avatar Support"
        iconColor="text-accent"
      />
      <FeatureItem
        icon={Image}
        text="NFT Avatar Support"
        iconColor="text-accent"
      />
      <FeatureItem
        icon={Image}
        text="No Watermark on Media"
        iconColor="text-accent"
      />
      <FeatureItem
        icon={FolderLock}
        text="Free Safety Folder"
        iconColor="text-accent"
      />
      <FeatureItem
        icon={Crown}
        text="White Crown Badge"
        iconColor="text-accent"
      />
      <FeatureItem
        icon={Play}
        text="Start and Host Spaces"
        iconColor="text-accent"
      />
      <FeatureItem
        icon={BarChart2}
        text="Access to Modern Analytics"
        iconColor="text-accent"
      />
    </>
  );
};
