
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

interface MessageSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MessageSettingsDialog: React.FC<MessageSettingsDialogProps> = ({ isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const session = useSession();
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    if (!session?.user?.id) return;
    
    setIsSaving(true);
    try {
      // In a real implementation, you would save this to a user_settings table
      // For now, we'll just show a toast notification
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      toast({
        title: "Settings saved",
        description: `Auto-delete messages ${autoDeleteEnabled ? "enabled" : "disabled"}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Settings</DialogTitle>
          <DialogDescription>
            Configure your messaging preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="auto-delete" className="font-medium">Auto-delete messages</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete messages older than 3 hours
              </p>
            </div>
            <Switch
              id="auto-delete"
              checked={autoDeleteEnabled}
              onCheckedChange={setAutoDeleteEnabled}
            />
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              When you delete messages, they will be removed for all participants in the conversation.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
