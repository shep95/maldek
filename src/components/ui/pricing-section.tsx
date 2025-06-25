
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { useSession } from "@supabase/auth-helpers-react"
import { useSubscription } from "@/hooks/useSubscription"
import { toast } from "sonner"
import { Image, Radio, Shield, Lock } from "lucide-react"

interface Feature {
  name: string
  description: string
  included: boolean
}

interface PricingTier {
  name: string
  price: {
    monthly: number
    yearly: number
  }
  description: string
  features: Feature[]
  highlight?: boolean
  badge?: string
  icon: React.ReactNode
}

interface PricingSectionProps {
  tiers: PricingTier[]
  className?: string
}

function PricingSection({ tiers, className }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false)
  const session = useSession()
  const { 
    subscribed,
    subscription_tier,
    subscription_end,
    createCheckoutSession,
    openCustomerPortal
  } = useSubscription()

  const buttonStyles = {
    default: cn(
      "h-12 bg-white dark:bg-zinc-900",
      "hover:bg-zinc-50 dark:hover:bg-zinc-800",
      "text-zinc-900 dark:text-zinc-100",
      "border border-zinc-200 dark:border-zinc-800",
      "hover:border-zinc-300 dark:hover:border-zinc-700",
      "shadow-sm hover:shadow-md",
      "text-sm font-medium",
    ),
    highlight: cn(
      "h-12 bg-zinc-900 dark:bg-zinc-100",
      "hover:bg-zinc-800 dark:hover:bg-zinc-300",
      "text-white dark:text-zinc-900",
      "shadow-[0_1px_15px_rgba(0,0,0,0.1)]",
      "hover:shadow-[0_1px_20px_rgba(0,0,0,0.15)]",
      "font-semibold text-base",
    ),
  }

  const badgeStyles = cn(
    "px-4 py-1.5 text-sm font-medium",
    "bg-zinc-900 dark:bg-zinc-100",
    "text-white dark:text-zinc-900",
    "border-none shadow-lg",
  )

  // Format price to ensure it displays properly
  const formatPrice = (price: number) => {
    return price % 1 === 0 ? price.toString() : price.toFixed(2);
  }

  // Helper function to get the display price based on tier name and billing period
  const getDisplayPrice = (tier: PricingTier, isYearly: boolean) => {
    return {
      price: formatPrice(isYearly ? tier.price.yearly : tier.price.monthly),
      period: isYearly ? "year" : "month"
    };
  }

  const handleSubscribeClick = (tier: PricingTier) => {
    if (!session) {
      toast.error("Please sign in to subscribe", {
        description: "You need to be logged in to purchase a subscription"
      });
      return;
    }

    createCheckoutSession(tier.name);
  }

  const isCurrentPlan = (tierName: string) => {
    return subscription_tier === tierName;
  }

  // Define our single premium tier with only the 4 specified features
  const premiumTier: PricingTier = {
    name: "Premium",
    price: {
      monthly: 7.99,
      yearly: 79.99
    },
    description: "Enhanced social experience with premium features",
    features: [
      {
        name: "GIF Profile Upload",
        description: "Upload animated GIFs as your profile picture",
        included: true
      },
      {
        name: "Access to Spaces",
        description: "Join and host audio conversations (beta testing)",
        included: true
      },
      {
        name: "No Watermarks",
        description: "Remove watermarks from all your media content",
        included: true
      },
      {
        name: "Private Posts with Encrypted Files",
        description: "Secure encrypted file storage up to 4GB",
        included: true
      }
    ],
    highlight: true,
    badge: "Popular",
    icon: <Shield className="w-6 h-6" />
  }

  return (
    <section
      className={cn(
        "relative bg-background text-foreground",
        "py-12 px-4 md:py-24 lg:py-32",
        "overflow-hidden",
        className,
      )}
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Simple, transparent pricing
          </h2>
          <div className="inline-flex items-center p-1.5 bg-white dark:bg-zinc-800/50 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm">
            {["Monthly", "Yearly"].map((period) => (
              <button
                key={period}
                onClick={() => setIsYearly(period === "Yearly")}
                className={cn(
                  "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                  (period === "Yearly") === isYearly
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div
              className={cn(
                "relative group backdrop-blur-sm",
                "rounded-3xl transition-all duration-300",
                "flex flex-col",
                "bg-gradient-to-b from-zinc-100/80 to-transparent dark:from-zinc-400/[0.15]",
                "border border-zinc-400/50 dark:border-zinc-400/20 shadow-xl",
                "hover:translate-y-0 hover:shadow-lg",
              )}
            >
              {premiumTier.badge && (
                <div className="absolute -top-4 left-6">
                  <Badge className={badgeStyles}>{premiumTier.badge}</Badge>
                </div>
              )}
              
              {isCurrentPlan(premiumTier.name) && (
                <div className="absolute -top-4 right-6">
                  <Badge className={cn(badgeStyles, "bg-green-600 dark:bg-green-500")}>Current Plan</Badge>
                </div>
              )}

              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
                    )}
                  >
                    {premiumTier.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {premiumTier.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                      ${getDisplayPrice(premiumTier, isYearly).price}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      /{getDisplayPrice(premiumTier, isYearly).period}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {premiumTier.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {premiumTier.features.map((feature) => (
                    <div key={feature.name} className="flex gap-4">
                      <div
                        className={cn(
                          "mt-1 p-0.5 rounded-full transition-colors duration-200",
                          feature.included
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-400 dark:text-zinc-600",
                        )}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {feature.name}
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                {isCurrentPlan(premiumTier.name) ? (
                  <Button
                    className={cn(
                      "w-full relative transition-all duration-300",
                      buttonStyles.highlight,
                    )}
                    onClick={openCustomerPortal}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Manage Subscription
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      "w-full relative transition-all duration-300",
                      buttonStyles.highlight,
                    )}
                    onClick={() => handleSubscribeClick(premiumTier)}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Subscribe Now
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { PricingSection }
