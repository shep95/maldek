
"use client"

import { useState } from "react"
import { PricingSection } from "@/components/ui/pricing-section"
import { Sparkles, Zap } from "lucide-react"

export function PricingSectionDemo() {
  const [isLoading] = useState(false)

  return (
    <div className="w-full">
      <PricingSection 
        tiers={[
          {
            name: "Premium",
            price: {
              monthly: 4.99,
              yearly: 49.99,
            },
            description: "Essential tools for content creators",
            icon: <Sparkles className="w-6 h-6" />,
            features: [
              {
                name: "AI Chat & Content Tools",
                description: "Generate and enhance content with AI",
                included: true,
              },
              {
                name: "GIF Upload Support",
                description: "Include animated GIFs in your posts",
                included: true,
              },
              {
                name: "Animated Avatar",
                description: "Stand out with animated profile pictures",
                included: true,
              },
              {
                name: "No Watermarks",
                description: "Clean media without Bosley watermarks",
                included: true,
              },
              {
                name: "Private Posts",
                description: "Control who can see your content",
                included: true,
              },
              {
                name: "Security Folder",
                description: "Store sensitive content securely",
                included: true,
              },
              {
                name: "Community Spaces",
                description: "Create and join audio spaces",
                included: true,
              },
              {
                name: "Priority Support",
                description: "Get help when you need it most",
                included: false,
              },
            ],
          },
          {
            name: "Pro",
            price: {
              monthly: 9.99, 
              yearly: 99.99,
            },
            description: "Advanced features for serious creators",
            icon: <Zap className="w-6 h-6" />,
            features: [
              {
                name: "All Premium Features",
                description: "Everything in the Premium tier",
                included: true,
              },
              {
                name: "Scheduled Posts",
                description: "Plan your content calendar",
                included: true,
              },
              {
                name: "Extended History",
                description: "Access your content history longer",
                included: true,
              },
              {
                name: "NFT Avatar Support",
                description: "Display your NFTs as avatars",
                included: true,
              },
              {
                name: "Priority Support",
                description: "Get help when you need it most",
                included: true,
              },
              {
                name: "Analytics Dashboard",
                description: "Detailed insights for your content",
                included: true,
              },
              {
                name: "Verified Checkmark",
                description: "Stand out with verification",
                included: true,
              },
              {
                name: "Custom Username Colors",
                description: "Make your name pop in conversations",
                included: true,
              },
            ],
            highlight: true,
            badge: "Most Popular",
          },
        ]}
      />
    </div>
  )
}
