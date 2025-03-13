
import { PricingCard } from "@/components/ui/pricing-card";

const Features = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <section className="relative overflow-hidden bg-background text-foreground">
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 md:px-8">
          <div className="mb-12 space-y-3">
            <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              All Features Available
            </h2>
            <p className="text-center text-base text-muted-foreground md:text-lg">
              Enjoy all premium features completely free!
            </p>
          </div>
          
          <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-3">
            <PricingCard
              tier="Free"
              price="$0"
              bestFor="For everyone!"
              CTA="Already Available"
              benefits={[
                { text: "Content creation", checked: true },
                { text: "Video uploads", checked: true },
                { text: "Community spaces", checked: true },
                { text: "Privacy features", checked: true },
                { text: "AI Assistant", checked: true },
                { text: "Analytics", checked: true },
              ]}
            />
            <PricingCard
              tier="Investment Opportunity"
              price="Contact us"
              bestFor="For investors"
              CTA="Learn More"
              benefits={[
                { text: "Early investor access", checked: true },
                { text: "Platform equity", checked: true },
                { text: "Revenue sharing", checked: true },
                { text: "Advisory board", checked: true },
                { text: "Strategic partnership", checked: true },
                { text: "Platform influence", checked: true },
              ]}
            />
            <PricingCard
              tier="Partnership"
              price="Contact us"
              bestFor="For businesses"
              CTA="Contact Us"
              benefits={[
                { text: "API access", checked: true },
                { text: "White-label solutions", checked: true },
                { text: "Custom integrations", checked: true },
                { text: "Enterprise support", checked: true },
                { text: "Dedicated account manager", checked: true },
                { text: "Co-marketing opportunities", checked: true },
              ]}
            />
          </div>
          
          <div className="bg-accent/10 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Why We Made Everything Free</h3>
            <p className="text-muted-foreground mb-6">
              We believe in building community first. By providing all features for free, 
              we're focusing on growing our user base and creating the best possible experience.
              In the future, we'll introduce revenue models that don't limit functionality for our users.
            </p>
            <Button className="bg-accent hover:bg-accent/90">
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
