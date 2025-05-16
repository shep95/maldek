
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { useSession } from "@supabase/auth-helpers-react"
import { useSubscription } from "@/hooks/useSubscription"
import { toast } from "sonner"

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
    isLoading,
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
    // For Pro tier, always show yearly price
    if (tier.name === "Pro") {
      return {
        price: formatPrice(tier.price.yearly),
        period: "year"
      };
    }
    
    // For other tiers, show monthly or yearly based on selection
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
            {["Subscriptions", "Investors"].map((period) => (
              <button
                key={period}
                onClick={() => setIsYearly(period === "Investors")}
                className={cn(
                  "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                  (period === "Investors") === isYearly
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {isYearly ? (
          <div className="flex flex-col items-center justify-center p-10 rounded-3xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 shadow-md">
            <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Investment Opportunities
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 text-lg text-center max-w-lg mb-6">
              Contact <span className="font-medium">asher@bosley.app</span> for potential partnerships and investments
            </p>
            <Button
              className={buttonStyles.highlight}
              onClick={() => window.location.href = "mailto:asher@bosley.app?subject=Investment Inquiry"}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Contact Now
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative group backdrop-blur-sm",
                  "rounded-3xl transition-all duration-300",
                  "flex flex-col",
                  tier.highlight
                    ? "bg-gradient-to-b from-zinc-100/80 to-transparent dark:from-zinc-400/[0.15]"
                    : "bg-white dark:bg-zinc-800/50",
                  "border",
                  tier.highlight
                    ? "border-zinc-400/50 dark:border-zinc-400/20 shadow-xl"
                    : "border-zinc-200 dark:border-zinc-700 shadow-md",
                  "hover:translate-y-0 hover:shadow-lg",
                )}
              >
                {tier.badge && tier.highlight && (
                  <div className="absolute -top-4 left-6">
                    <Badge className={badgeStyles}>{tier.badge}</Badge>
                  </div>
                )}
                
                {isCurrentPlan(tier.name) && (
                  <div className="absolute -top-4 right-6">
                    <Badge className={cn(badgeStyles, "bg-green-600 dark:bg-green-500")}>Current Plan</Badge>
                  </div>
                )}

                <div className="p-8 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        tier.highlight
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
                      )}
                    >
                      {tier.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {tier.name}
                    </h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      {/* Updated to show fixed price of $28.00 */}
                      <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                        $28.00
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        /month
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {tier.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {tier.features.map((feature) => (
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
                  {isCurrentPlan(tier.name) ? (
                    <Button
                      className={cn(
                        "w-full relative transition-all duration-300",
                        tier.highlight
                          ? buttonStyles.highlight
                          : buttonStyles.default,
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
                        tier.highlight
                          ? buttonStyles.highlight
                          : buttonStyles.default,
                      )}
                      onClick={() => handleSubscribeClick(tier)}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {tier.highlight ? (
                          <>
                            Subscribe
                            <ArrowRightIcon className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Subscribe
                            <ArrowRightIcon className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export { PricingSection }
