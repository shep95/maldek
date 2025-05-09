
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Key, Lock } from "lucide-react";
import { toast } from "sonner";

interface SecuritySetupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupComplete: (securityCode: string) => void;
  userId: string | null;
}

export const SecuritySetupDialog = ({
  isOpen,
  onOpenChange,
  onSetupComplete,
  userId
}: SecuritySetupDialogProps) => {
  const [securityCode, setSecurityCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetup = () => {
    try {
      setIsSubmitting(true);

      // Validate the security code
      if (securityCode.length < 4) {
        toast.error("Security code must be at least 4 characters");
        return;
      }

      // Confirm the codes match
      if (securityCode !== confirmCode) {
        toast.error("Security codes do not match");
        return;
      }

      // Call the parent component's setup function
      onSetupComplete(securityCode);
      
      // Reset the form
      setSecurityCode("");
      setConfirmCode("");
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Security setup error:", error);
      toast.error("Failed to set up security");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Set Up End-to-End Encryption
          </DialogTitle>
          <DialogDescription>
            Create a security code to encrypt your files and messages. This code will be used to protect your data with end-to-end encryption.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gradient-to-br from-accent/5 to-background/80 p-4 rounded-lg border border-accent/20">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-accent/10 rounded-full">
              <Lock className="h-8 w-8 text-accent" />
            </div>
          </div>
          
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              This security code encrypts all your sensitive data on your device before it's sent to our servers. 
              <span className="block font-bold text-accent mt-1">
                We cannot recover this code if you forget it!
              </span>
            </p>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Create security code"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                className="text-center"
                autoComplete="new-password"
              />
              <Input
                type="password"
                placeholder="Confirm security code"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="text-center"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleSetup} 
            className="w-full"
            disabled={isSubmitting || !securityCode || securityCode !== confirmCode}
          >
            <Key className="h-4 w-4 mr-2" />
            Set Up Encryption
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By setting up encryption, all your sensitive files, messages, and media will be protected with end-to-end encryption. Only you and those you share your security code with can decrypt your data.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
