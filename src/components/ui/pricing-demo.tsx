
"use client"

import { Sparkles, Zap, ArrowDownToDot } from "lucide-react"
import { PricingSection } from "@/components/ui/pricing-section"

const defaultTiers = [
  {
    name: "Creator",
    price: {
      monthly: 3.50,
      yearly: 35,
    },
    description: "Perfect for individuals and small projects",
    icon: (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/30 to-gray-500/30 blur-2xl rounded-full" />
        <Zap className="w-7 h-7 relative z-10 text-gray-500 dark:text-gray-400 animate-[float_3s_ease-in-out_infinite]" />
      </div>
    ),
    features: [
      {
        name: "Verified Badge",
        description: "Instant verification with Premium",
        included: true,
      },
      {
        name: "Bosley Spaces Priority",
        description: "Get priority access to Spaces features",
        included: true,
      },
      {
        name: "Reply Boost",
        description: "Increase visibility of your replies",
        included: false,
      },
      {
        name: "Faster Media Downloads",
        description: "Experience quicker download speeds",
        included: false,
      },
      {
        name: "Faster Uploads",
        description: "Enjoy enhanced upload speeds",
        included: false,
      },
    ],
  },
  {
    name: "Pro",
    price: {
      monthly: 28.00,
      yearly: 280,
    },
    description: "Ideal for growing teams and businesses",
    highlight: true,
    badge: "Most Popular",
    icon: (
      <div className="relative">
        <ArrowDownToDot className="w-7 h-7 relative z-10" />
      </div>
    ),
    features: [
      {
        name: "Verified Badge",
        description: "Instant verification with Premium",
        included: true,
      },
      {
        name: "Bosley Spaces Priority",
        description: "Get priority access to Spaces features",
        included: true,
      },
      {
        name: "Reply Boost",
        description: "Increase visibility of your replies",
        included: true,
      },
      {
        name: "Faster Media Downloads",
        description: "Experience quicker download speeds",
        included: true,
      },
      {
        name: "Faster Uploads",
        description: "Enjoy enhanced upload speeds",
        included: true,
      },
    ],
  },
]

function PricingSectionDemo() {
  return <PricingSection tiers={defaultTiers} />
}

export { PricingSectionDemo }
