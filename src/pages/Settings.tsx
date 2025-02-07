
import { AccountSection } from "@/components/settings/AccountSection";
import { EmailSection } from "@/components/settings/EmailSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { DangerSection } from "@/components/settings/DangerSection";
import { DownloadSection } from "@/components/settings/DownloadSection";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  console.log("Rendering Settings page");

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in bg-background">
      <h1 className="text-3xl font-bold">Settings</h1>
      <ThemeToggle />
      <DownloadSection />
      <LanguageSection />
      <AccountSection />
      <EmailSection />
      <PasswordSection />
      <DangerSection />
      
      <div className="flex flex-col space-y-4 pt-4 border-t">
        <h2 className="text-xl font-semibold">Legal</h2>
        <Button 
          variant="ghost" 
          className="flex items-center justify-start gap-2 text-muted-foreground"
          onClick={() => navigate('/terms')}
        >
          <ExternalLink className="h-4 w-4" />
          Terms of Service
        </Button>
      </div>
    </div>
  );
};

export default Settings;
