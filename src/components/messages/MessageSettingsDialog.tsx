
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessageSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MessageSettingsDialog: React.FC<MessageSettingsDialogProps> = ({ isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const session = useSession();
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();

  const handleSaveSettings = async () => {
    if (!session?.user?.id) return;
    
    setIsSaving(true);
    try {
      // In a real implementation, you would save this to a user_settings table
      // For now, we'll just show a toast notification
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      toast.success(`Auto-delete messages ${autoDeleteEnabled ? "enabled" : "disabled"}`);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const dialogContentElement = (
    <>
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex-1">
            <Label htmlFor="auto-delete" className="font-medium">Auto-delete messages</Label>
            <p className="text-sm text-muted-foreground">
              Automatically delete messages older than 3 hours
            </p>
          </div>
          <Switch
            id="auto-delete"
            checked={autoDeleteEnabled}
            onCheckedChange={setAutoDeleteEnabled}
            className="touch-target"
          />
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            When you delete messages, they will be removed for all participants in the conversation.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-end">
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto min-h-[44px]"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="w-full sm:w-auto min-h-[44px]"
        >
          Save Changes
        </Button>
      </div>
    </>
  );
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6 max-h-[85vh]">
          <DrawerHeader className="pt-6 pb-2">
            <DrawerTitle>Message Settings</DrawerTitle>
            <DrawerDescription>
              Configure your messaging preferences
            </DrawerDescription>
          </DrawerHeader>
          
          {dialogContentElement}
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle>Message Settings</DialogTitle>
          <DialogDescription>
            Configure your messaging preferences
          </DialogDescription>
        </DialogHeader>
        
        {dialogContentElement}
      </DialogContent>
    </Dialog>
  );
};
