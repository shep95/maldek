import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Shield, AlertOctagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface TermsOfServiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export const TermsOfServiceDialog = ({
  isOpen,
  onOpenChange,
  onAccept,
}: TermsOfServiceDialogProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const checkAcceptance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.error('No user found');
        return;
      }

      setUserId(user.id);

      // Check if user has already accepted terms
      const { data: acceptance, error } = await supabase
        .from('terms_acceptance')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking terms acceptance:', error);
        return;
      }

      if (acceptance) {
        console.log('User has already accepted terms');
        setHasAccepted(true);
        onAccept(); // Automatically trigger accept callback
        onOpenChange(false); // Close dialog
      }
    };
    
    if (isOpen) {
      checkAcceptance();
    }
  }, [isOpen, onAccept, onOpenChange]);

  const handleAccept = async () => {
    if (!userId) {
      toast.error('Unable to verify user identity');
      return;
    }

    try {
      setIsAccepting(true);
      
      const { error } = await supabase
        .from('terms_acceptance')
        .insert({
          user_id: userId,
          version: '1.0'
        });

      if (error) throw error;

      setHasAccepted(true);
      onAccept();
      onOpenChange(false);
      toast.success('Terms of Service accepted');
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast.error('Failed to accept Terms of Service');
    } finally {
      setIsAccepting(false);
    }
  };

  // If user has already accepted, don't render the dialog
  if (hasAccepted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Terms of Service</DialogTitle>
          </div>
          <DialogDescription>
            Please review and accept our Terms of Service before continuing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Content Guidelines</h3>
                <p className="text-sm text-muted-foreground">
                  You agree to post content that respects our community guidelines and does not violate any laws or regulations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertOctagon className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Important Notice</h3>
                <p className="text-sm text-muted-foreground">
                  By accepting these terms, you acknowledge that your content may be removed if it violates our guidelines, and repeated violations may result in account suspension.
                </p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={handleAccept}
            disabled={isAccepting || !userId}
          >
            {isAccepting ? 'Accepting...' : 'Accept Terms of Service'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};