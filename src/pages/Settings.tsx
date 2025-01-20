import { AccountSection } from "@/components/settings/AccountSection";
import { EmailSection } from "@/components/settings/EmailSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { DangerSection } from "@/components/settings/DangerSection";
import { DownloadSection } from "@/components/settings/DownloadSection";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { BackgroundMusicSection } from "@/components/settings/BackgroundMusicSection";
import { BackgroundImageSection } from "@/components/settings/BackgroundImageSection";

const Settings = () => {
  console.log("Rendering Settings page");

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in bg-background">
      <h1 className="text-3xl font-bold">Settings</h1>
      <BackgroundImageSection />
      <ThemeToggle />
      <BackgroundMusicSection />
      <DownloadSection />
      <LanguageSection />
      <AccountSection />
      <EmailSection />
      <PasswordSection />
      <DangerSection />
    </div>
  );
};

export default Settings;