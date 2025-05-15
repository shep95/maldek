
import { PricingSection } from "@/components/ui/pricing-section"
import { BadgeCheck, Sparkles } from "lucide-react"

export function PricingSectionDemo() {
  return (
    <PricingSection
      tiers={[
        {
          name: "Creator",
          price: {
            monthly: 3.5,
            yearly: 36.0
          },
          description: "Perfect for individuals and small projects",
          highlight: true,
          badge: "Popular",
          icon: <BadgeCheck className="w-5 h-5" />,
          features: [
            {
              name: "All Free Features",
              description: "Access to all standard platform functionality",
              included: true,
            },
            {
              name: "AI Chat & Tools",
              description: "Access the AI assistant and content enhancement tools",
              included: true,
            },
            {
              name: "GIF Upload Support",
              description: "Upload and share GIFs on your posts and comments",
              included: true,
            },
            {
              name: "Animated Avatar Support",
              description: "Use animated avatars on your profile",
              included: true,
            },
            {
              name: "Media Without Watermark",
              description: "All your uploaded media is watermark-free",
              included: true,
            },
            {
              name: "Private Posts & Privacy Features",
              description: "Enhanced privacy controls for your content",
              included: true,
            },
            {
              name: "Priority Support",
              description: "Get help faster when you need it",
              included: true,
            },
          ],
        },
        {
          name: "Pro",
          price: {
            monthly: 28,
            yearly: 280
          },
          description: "For serious content creators and growing businesses",
          icon: <Sparkles className="w-5 h-5" />,
          features: [
            {
              name: "Everything in Creator",
              description: "All features from the Creator plan",
              included: true,
            },
            {
              name: "NFT Avatar Support",
              description: "Use your NFTs as profile pictures",
              included: true,
            },
            {
              name: "Start and Host Spaces",
              description: "Create and manage your own audio spaces",
              included: true,
            },
            {
              name: "Advanced Analytics",
              description: "Detailed insights and performance metrics",
              included: true,
            },
            {
              name: "More Storage",
              description: "Double the media storage capacity",
              included: true,
            },
            {
              name: "Larger File Uploads",
              description: "Upload larger files and longer videos",
              included: true,
            },
            {
              name: "Free Safety Folder",
              description: "Extra security for your private content",
              included: true,
            },
          ],
        },
      ]}
    />
  )
}
