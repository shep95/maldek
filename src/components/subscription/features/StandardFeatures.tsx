
import { Check, FileVideo, MessageSquare, Clock, Trophy } from "lucide-react";
import { FeatureItem } from "./FeatureItem";

interface StandardFeaturesProps {
  tier: {
    monthly_mentions: number;
    max_upload_size_mb: number;
    post_character_limit?: number;
    schedule_days_limit: number;
    max_pinned_posts: number;
  };
}

export const StandardFeatures = ({ tier }: StandardFeaturesProps) => {
  return (
    <>
      <FeatureItem
        icon={Check}
        text={`${tier.monthly_mentions.toLocaleString()} mentions per month`}
        iconColor="text-green-500"
      />
      <FeatureItem
        icon={FileVideo}
        text={`Upload files up to ${tier.max_upload_size_mb}MB`}
        iconColor="text-accent"
      />
      <FeatureItem
        icon={MessageSquare}
        text={`${tier.post_character_limit?.toLocaleString()} character limit`}
        iconColor="text-accent"
      />
      <FeatureItem
        icon={Clock}
        text={`Schedule posts up to ${tier.schedule_days_limit} days ahead`}
        iconColor="text-accent"
      />
      <FeatureItem
        icon={Trophy}
        text={`Pin up to ${tier.max_pinned_posts} ${tier.max_pinned_posts === 1 ? 'post' : 'posts'}`}
        iconColor="text-accent"
      />
    </>
  );
};
