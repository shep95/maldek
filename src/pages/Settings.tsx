import { AccountSection } from "@/components/settings/AccountSection";
import { EmailSection } from "@/components/settings/EmailSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { DangerSection } from "@/components/settings/DangerSection";

const Settings = () => {
  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      <AccountSection />
      <EmailSection />
      <PasswordSection />
      <DangerSection />
    </div>
  );
};

export default Settings;