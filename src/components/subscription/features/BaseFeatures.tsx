
import { Download, Mic, BarChart2 } from "lucide-react";
import { FeatureItem } from "./FeatureItem";

export const BaseFeatures = () => {
  return (
    <>
      <FeatureItem
        icon={Download}
        text="Download videos and images"
        iconColor="text-white"
      />
      <FeatureItem
        icon={Mic}
        text="Access to Spaces"
        iconColor="text-white"
        badge={{ text: "BETA", variant: "beta" }}
      />
      <FeatureItem
        icon={BarChart2}
        text="Advanced Analytics Dashboard"
        iconColor="text-white"
        badge={{ text: "PRO", variant: "pro" }}
      />
    </>
  );
};
