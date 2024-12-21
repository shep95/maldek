import { AccountSection } from "@/components/settings/AccountSection";
import { EmailSection } from "@/components/settings/EmailSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { DangerSection } from "@/components/settings/DangerSection";
import { DownloadSection } from "@/components/settings/DownloadSection";
import { LanguageSection } from "@/components/settings/LanguageSection";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Settings</h1>
        <DownloadSection />
        <LanguageSection />
        <AccountSection />
        <EmailSection />
        <PasswordSection />
        <DangerSection />
      </div>
    </div>
  );
};

export default Settings;