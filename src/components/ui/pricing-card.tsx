import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StarBorder } from "@/components/ui/star-border"

interface BenefitProps {
  text: string
  checked: boolean
}

const Benefit = ({ text, checked }: BenefitProps) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-4 place-content-center rounded-full bg-primary text-sm text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : (
        <span className="grid size-4 place-content-center rounded-full dark:bg-zinc-800 bg-zinc-200 text-sm dark:text-zinc-400 text-zinc-600">
          <X className="size-3" />
        </span>
      )}
      <span className="text-sm dark:text-zinc-300 text-zinc-600">{text}</span>
    </div>
  )
}

interface PricingCardProps {
  tier: string
  price: string
  bestFor: string
  CTA: string
  benefits: Array<{ text: string; checked: boolean }>
  className?: string
  onClickCTA?: () => void
  isCurrentPlan?: boolean
}

export const PricingCard = ({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  className,
  onClickCTA,
  isCurrentPlan = false,
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ filter: "blur(2px)" }}
      whileInView={{ filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeInOut", delay: 0.25 }}
      className="w-full"
    >
      <StarBorder
        as="div"
        className="w-full"
        color="hsl(var(--accent))"
        speed="12s"
        transparent={true}
      >
        <Card
          className={cn(
            "relative w-full overflow-hidden border-none",
            "dark:bg-gradient-to-br dark:from-zinc-950/50 dark:to-zinc-900/80",
            "bg-gradient-to-br from-zinc-50/50 to-zinc-100/80",
            "p-6",
            isCurrentPlan && "shadow-md ring-1 ring-accent",
            className,
          )}
        >
          <div className="flex flex-col items-start border-b pb-6 dark:border-zinc-700 border-zinc-200 w-full">
            <span className="mb-6 inline-block dark:text-zinc-50 text-zinc-900">
              {tier}
            </span>
            <span className="mb-3 inline-block text-4xl font-medium">
              {price}
            </span>
            <span className="dark:bg-gradient-to-br dark:from-zinc-200 dark:to-zinc-500 bg-gradient-to-br from-zinc-700 to-zinc-900 bg-clip-text text-start text-transparent">
              {bestFor}
            </span>
            {isCurrentPlan && (
              <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                Current Plan
              </span>
            )}
          </div>
          <div className="space-y-4 py-9">
            {benefits.map((benefit, index) => (
              <Benefit key={index} {...benefit} />
            ))}
          </div>
          <Button
            className="w-full"
            variant={tier === "Pro" ? "default" : "ghost"}
            onClick={onClickCTA}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? 'Current Plan' : CTA}
          </Button>
        </Card>
      </StarBorder>
    </motion.div>
  )
}
