
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
              monthly: 3.50,
              yearly: 28.00,
            },
            description: "Essential tools for content creators",
            icon: <Sparkles className="w-6 h-6" />,
            features: [
              {
                name: "GIF Profile Upload",
                description: "Upload animated GIFs as your profile picture",
                included: true,
              },
              {
                name: "Access to Spaces",
                description: "Join and create audio spaces (beta testing)",
                included: true,
              },
              {
                name: "No Watermarks",
                description: "Clean media without Bosley watermarks",
                included: true,
              },
              {
                name: "Private Posts with Secure Files",
                description: "Encrypted file storage up to 4GB",
                included: true,
              },
            ],
          },
          {
            name: "Pro",
            price: {
              monthly: 3.50, 
              yearly: 28.00,
            },
            description: "Advanced features for serious creators",
            icon: <Zap className="w-6 h-6" />,
            features: [
              {
                name: "GIF Profile Upload",
                description: "Upload animated GIFs as your profile picture",
                included: true,
              },
              {
                name: "Access to Spaces",
                description: "Join and create audio spaces (beta testing)",
                included: true,
              },
              {
                name: "No Watermarks",
                description: "Clean media without Bosley watermarks",
                included: true,
              },
              {
                name: "Private Posts with Secure Files",
                description: "Encrypted file storage up to 4GB",
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
