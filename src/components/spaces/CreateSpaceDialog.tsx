import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateSpaceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSpaceCreated: () => void;
}

export const CreateSpaceDialog = ({
  isOpen,
  onOpenChange,
  onSpaceCreated
}: CreateSpaceDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSpace = async () => {
    try {
      setIsCreating(true);
      console.log("Creating space with title:", title);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a space");
        return;
      }

      const { data: space, error } = await supabase
        .from('spaces')
        .insert({
          title,
          description,
          host_id: user.id,
          status: 'live',
          started_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) throw error;

      // Add host as first participant
      const { error: participantError } = await supabase
        .from('space_participants')
        .insert({
          space_id: space.id,
          user_id: user.id,
          role: 'host'
        });

      if (participantError) throw participantError;

      console.log("Space created successfully:", space);
      toast.success("Space created successfully!");
      onSpaceCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating space:", error);
      toast.error("Failed to create space");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Create a Space</h2>
          <div>
            <Input
              placeholder="Space title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSpace}
              disabled={!title || isCreating}
            >
              Create Space
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};