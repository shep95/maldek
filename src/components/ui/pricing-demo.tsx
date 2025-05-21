
// Demo pricing section that uses the underlying pricing-section component
import { PricingSection } from "./pricing-section";
import { Terminal, Blocks, Zap } from "lucide-react";

export function PricingSectionDemo() {
  const tiers = [
    {
      name: "Free",
      price: {
        monthly: 0,
        yearly: 0,
      },
      description: "Basic features for all users",
      features: [
        {
          name: "Standard Posts",
          description: "Create text and media posts",
          included: true,
        },
        {
          name: "Basic Messaging",
          description: "One-on-one private messaging",
          included: true,
        },
        {
          name: "Follow Users",
          description: "Follow your favorite users",
          included: true,
        },
        {
          name: "Video Upload",
          description: "Upload and share videos",
          included: true,
        },
        {
          name: "Live Spaces (View Only)",
          description: "Listen to live audio spaces",
          included: true,
        },
        {
          name: "Verification Checkmark",
          description: "Show verification on your profile",
          included: false,
        },
        {
          name: "Host Live Spaces",
          description: "Create and host live audio spaces",
          included: false,
        },
        {
          name: "Premium Features",
          description: "Access all premium features",
          included: false,
        },
      ],
      icon: <Terminal className="h-6 w-6" />,
    },
    {
      name: "Creator",
      price: {
        monthly: 3.50,
        yearly: 35,
      },
      description: "Perfect for creators and active users",
      highlight: true,
      badge: "Most Popular",
      features: [
        {
          name: "Everything in Free",
          description: "All features in the free plan",
          included: true,
        },
        {
          name: "Verification Checkmark",
          description: "Blue verification badge on your profile",
          included: true,
        },
        {
          name: "Host Live Spaces",
          description: "Create and host your own live audio spaces",
          included: true,
        },
        {
          name: "Animated Avatars",
          description: "Use animated GIFs as your profile picture",
          included: true,
        },
        {
          name: "Watermark-Free Content",
          description: "Download and share without watermarks",
          included: true,
        },
        {
          name: "Priority Support",
          description: "Get faster responses to your queries",
          included: true,
        },
        {
          name: "Advanced Analytics",
          description: "Detailed insights about your content",
          included: true,
        },
        {
          name: "Private Posts",
          description: "Create posts visible only to subscribers",
          included: true,
        },
      ],
      icon: <Blocks className="h-6 w-6" />,
    },
    {
      name: "Pro",
      price: {
        monthly: 28,
        yearly: 28,
      },
      description: "For professionals and businesses",
      features: [
        {
          name: "Everything in Creator",
          description: "All features in the Creator plan",
          included: true,
        },
        {
          name: "Premium Verification",
          description: "Gold verification badge on your profile",
          included: true,
        },
        {
          name: "Multiple Hosts in Spaces",
          description: "Add multiple hosts to your live spaces",
          included: true,
        },
        {
          name: "API Access",
          description: "Integrate with your own applications",
          included: true,
        },
        {
          name: "White-Label Options",
          description: "Brand your content with your own identity",
          included: true,
        },
        {
          name: "Premium Customer Support",
          description: "24/7 dedicated support channel",
          included: true,
        },
        {
          name: "No Ads",
          description: "Ad-free experience across the platform",
          included: true,
        },
        {
          name: "HD Media Quality",
          description: "Highest quality for all uploads",
          included: true,
        },
      ],
      icon: <Zap className="h-6 w-6" />,
    },
  ];

  return <PricingSection tiers={tiers} />;
}
