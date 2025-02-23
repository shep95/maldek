
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Terms of Service</h1>
        <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
          Go Back
        </Button>
      </div>

      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Our Mission</h2>
          <p className="text-sm sm:text-base">Our mission since September 5th 2024 is to protect human rights of speech and privacy. We do not collect any data besides email and passwords and any public posts you make including profile pictures, posts, imagines and videos.</p>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-sm sm:text-base">By accessing and using Bosley, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.</p>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">2. User Accounts</h2>
          <p className="text-sm sm:text-base">Users must be at least 13 years old to create an account. You are responsible for maintaining the security of your account and password. Bosley cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">3. Content Guidelines</h2>
          <p className="text-sm sm:text-base">Users are responsible for all content posted and activity that occurs under their account. Prohibited content includes:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
            <li>Illegal content or activities</li>
            <li>Harassment or hate speech</li>
            <li>Spam or deceptive practices</li>
            <li>Malware or malicious content</li>
            <li>Content that violates intellectual property rights</li>
          </ul>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">4. Privacy</h2>
          <p className="text-sm sm:text-base">Your privacy is important to us. Our use and collection of your data is governed by our Privacy Policy. By using Bosley, you agree to our collection and use of information as described therein.</p>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">5. Termination</h2>
          <p className="text-sm sm:text-base">We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service.</p>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">6. Changes to Terms</h2>
          <p className="text-sm sm:text-base">We reserve the right to modify or replace these terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page. Your continued use of the platform after any such changes constitutes your acceptance of the new Terms of Service.</p>
        </section>

        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">7. Contact Information</h2>
          <p className="text-sm sm:text-base">For any questions about these Terms of Service, please contact us at support@bosley.app</p>
        </section>
      </Card>
    </div>
  );
};

export default TermsOfService;
