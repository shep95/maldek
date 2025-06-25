
import { PricingCard } from "@/components/ui/dark-gradient-pricing"

const benefits = [
  { text: "GIF profile upload", checked: true },
  { text: "Access to Spaces (beta testing)", checked: true },
  { text: "No watermarks", checked: true },
  { text: "Private posts with secure encrypted files (4GB storage)", checked: true },
]

export const PricingSectionDemo = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Unlock premium features with our subscription plan
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <PricingCard
              tier="Premium"
              price="$7.99/mo"
              bestFor="Enhanced social experience"
              CTA="Subscribe Now"
              benefits={benefits}
              className="border-accent/50 shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
