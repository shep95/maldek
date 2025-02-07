
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, DollarSign, Globe, Mail, User } from "lucide-react";
import { toast } from "sonner";

interface AdvertisementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 
  | "company"
  | "budget"
  | "business-type"
  | "ad-type"
  | "shoutout-payment"
  | "shoutout-equity"
  | "not-qualified"
  | "partnership-qualified"
  | "shoutout-qualified";

export const AdvertisementDialog = ({ open, onOpenChange }: AdvertisementDialogProps) => {
  const [step, setStep] = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");

  const handleRestart = () => {
    setStep("company");
    setCompanyName("");
  };

  const handlePartnershipQualified = () => {
    const mailtoLink = `mailto:asher@bosley.app?subject=Partnership Inquiry - ${companyName}&body=Company Name: ${companyName}%0D%0A%0D%0APlease include:%0D%0A- Your name%0D%0A- Business details%0D%0A- Starting bid ($3,500+ per month)`;
    window.open(mailtoLink);
    toast.success("You're qualified! Redirecting to email...");
    onOpenChange(false);
  };

  const handleShoutoutQualified = () => {
    const mailtoLink = `mailto:asher@bosley.app?subject=Shoutout Inquiry - ${companyName}&body=Company Name: ${companyName}%0D%0A%0D%0APlease include:%0D%0A- Your phone number%0D%0A- Business details%0D%0A- Business founding date%0D%0A- Starting bid ($17,000+)%0D%0A- Confirmation of 5% equity and royalties agreement`;
    window.open(mailtoLink);
    toast.success("You're qualified! Redirecting to email...");
    onOpenChange(false);
  };

  const renderStep = () => {
    switch (step) {
      case "company":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Welcome to Premium Advertising</h2>
              <p className="text-muted-foreground">Let's start with your company details</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter your company name"
                    className="pl-10"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => companyName ? setStep("budget") : toast.error("Please enter your company name")}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case "budget":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Monthly Advertising Budget</h2>
              <p className="text-muted-foreground">What's your monthly advertising budget?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => setStep("business-type")} className="h-auto py-4">
                <DollarSign className="mr-2 h-5 w-5" />
                Over $3,500 per month
              </Button>
              <Button onClick={() => setStep("not-qualified")} variant="outline" className="h-auto py-4">
                Under $3,500 per month
              </Button>
            </div>
          </div>
        );

      case "business-type":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Business Type</h2>
              <p className="text-muted-foreground">What type of business do you operate?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => setStep("ad-type")} className="h-auto py-4">
                <Globe className="mr-2 h-5 w-5" />
                Digital Business
              </Button>
              <Button onClick={() => setStep("not-qualified")} variant="outline" className="h-auto py-4">
                In-Person Business
              </Button>
            </div>
          </div>
        );

      case "ad-type":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Advertisement Type</h2>
              <p className="text-muted-foreground">Choose your preferred advertising method</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => setStep("partnership-qualified")} className="h-auto py-4">
                Partnerships Tab Placement
              </Button>
              <Button onClick={() => setStep("shoutout-payment")} variant="outline" className="h-auto py-4">
                Promoted by Asher
              </Button>
            </div>
          </div>
        );

      case "shoutout-payment":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">One-Time Payment</h2>
              <p className="text-muted-foreground">Are you willing to make a one-time payment of $17,000 for the shoutout?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => setStep("shoutout-equity")} className="h-auto py-4">
                Yes, I can make the payment
              </Button>
              <Button onClick={() => setStep("not-qualified")} variant="outline" className="h-auto py-4">
                No, that's beyond my budget
              </Button>
            </div>
          </div>
        );

      case "shoutout-equity":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Equity Agreement</h2>
              <p className="text-muted-foreground">Are you willing to provide 5% equity and royalties to Asher for the shoutout?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => setStep("shoutout-qualified")} className="h-auto py-4">
                Yes, I agree to the terms
              </Button>
              <Button onClick={() => setStep("not-qualified")} variant="outline" className="h-auto py-4">
                No, I cannot agree to this
              </Button>
            </div>
          </div>
        );

      case "not-qualified":
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold text-red-500">Not Qualified</h2>
            <p className="text-muted-foreground">
              We apologize, but you don't meet the qualification criteria for our advertising program at this time.
            </p>
            <Button onClick={handleRestart} variant="outline">
              Start Over
            </Button>
          </div>
        );

      case "partnership-qualified":
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold text-green-500">Congratulations!</h2>
            <p className="text-muted-foreground">
              You qualify for our partnerships program! Click below to send your details to Asher.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=asher@bosley.app&su=Partnership Inquiry - ${companyName}&body=Company Name: ${companyName}%0D%0A%0D%0APlease include:%0D%0A- Your name%0D%0A- Business details%0D%0A- Starting bid ($3,500+ per month)`;
                  window.open(gmailLink);
                  toast.success("Opening Gmail...");
                  onOpenChange(false);
                }}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Open in Gmail
              </Button>
              <Button 
                onClick={() => {
                  const outlookLink = `https://outlook.office.com/mail/deeplink/compose?to=asher@bosley.app&subject=Partnership Inquiry - ${companyName}&body=Company Name: ${companyName}%0D%0A%0D%0APlease include:%0D%0A- Your name%0D%0A- Business details%0D%0A- Starting bid ($3,500+ per month)`;
                  window.open(outlookLink);
                  toast.success("Opening Outlook...");
                  onOpenChange(false);
                }}
                variant="outline"
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Open in Outlook
              </Button>
              <Button 
                onClick={handlePartnershipQualified}
                variant="outline"
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Open in Default Email Client
              </Button>
            </div>
          </div>
        );

      case "shoutout-qualified":
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold text-green-500">Congratulations!</h2>
            <p className="text-muted-foreground">
              You qualify for the shoutout program! Click below to send your details to Asher.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=asher@bosley.app&su=Shoutout Inquiry - ${companyName}&body=Company Name: ${companyName}%0D%0A%0D%0APlease include:%0D%0A- Your phone number%0D%0A- Business details%0D%0A- Business founding date%0D%0A- Starting bid ($17,000+)%0D%0A- Confirmation of 5% equity and royalties agreement`;
                  window.open(gmailLink);
                  toast.success("Opening Gmail...");
                  onOpenChange(false);
                }}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Open in Gmail
              </Button>
              <Button 
                onClick={() => {
                  const outlookLink = `https://outlook.office.com/mail/deeplink/compose?to=asher@bosley.app&subject=Shoutout Inquiry - ${companyName}&body=Company Name: ${companyName}%0D%0A%0D%0APlease include:%0D%0A- Your phone number%0D%0A- Business details%0D%0A- Business founding date%0D%0A- Starting bid ($17,000+)%0D%0A- Confirmation of 5% equity and royalties agreement`;
                  window.open(outlookLink);
                  toast.success("Opening Outlook...");
                  onOpenChange(false);
                }}
                variant="outline"
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Open in Outlook
              </Button>
              <Button 
                onClick={handleShoutoutQualified}
                variant="outline"
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Open in Default Email Client
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

