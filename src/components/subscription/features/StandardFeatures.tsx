
import { Lock, MessageSquare, Calendar, Clock } from "lucide-react";
import { FeatureItem } from "./FeatureItem";

export const StandardFeatures = ({ tier }: { tier: any }) => {
  const isCreator = tier.name === 'Creator';
  const isEmperor = tier.name === 'True Emperor';
  
  return (
    <>
      {(isCreator || isEmperor) && (
        <FeatureItem
          icon={Lock}
          text="Private Posts & Privacy Features"
          iconColor="text-white"
        />
      )}
      <FeatureItem
        icon={MessageSquare}
        text="Priority Customer Support"
        iconColor="text-white"
      />
      <FeatureItem
        icon={Calendar}
        text="Schedule Posts"
        iconColor="text-white"
      />
      <FeatureItem
        icon={Clock}
        text="Extended View History"
        iconColor="text-white"
      />
    </>
  );
};
