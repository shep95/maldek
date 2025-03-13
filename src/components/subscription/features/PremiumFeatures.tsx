
import { Image, Sparkles, FolderLock } from "lucide-react";
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
    </>
  );
};
