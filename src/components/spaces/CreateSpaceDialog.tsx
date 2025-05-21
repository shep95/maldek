
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateSpaceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSpaceCreated?: () => void;
}

export const CreateSpaceDialog = ({
  isOpen,
  onOpenChange,
  onSpaceCreated,
}: CreateSpaceDialogProps) => {
  const session = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isRecorded, setIsRecorded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSpace = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your space");
      return;
    }

    if (isScheduled && !scheduledDate) {
      toast.error("Please select a date for your scheduled space");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the space
      const { data: space, error: spaceError } = await supabase
        .from("spaces")
        .insert({
          title,
          description,
          host_id: session?.user?.id,
          status: isScheduled ? "scheduled" : "live",
          scheduled_for: isScheduled ? scheduledDate?.toISOString() : null,
          is_recorded: isRecorded,
          max_speakers: 10,
        })
        .select()
        .single();

      if (spaceError) throw spaceError;

      // Add the host as a participant with 'host' role
      const { error: participantError } = await supabase
        .from("space_participants")
        .insert({
          space_id: space.id,
          user_id: session?.user?.id,
          role: "host",
        });

      if (participantError) throw participantError;

      toast.success(
        isScheduled
          ? "Space scheduled successfully"
          : "Space created successfully"
      );
      
      // Close the dialog
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setIsScheduled(false);
      setScheduledDate(undefined);
      setIsRecorded(false);
      
      // Callback to parent component
      if (onSpaceCreated) {
        onSpaceCreated();
      }
      
      // If it's not scheduled, redirect to the space
      if (!isScheduled) {
        window.location.href = `/spaces?id=${space.id}`;
      }
    } catch (error) {
      console.error("Error creating space:", error);
      toast.error("Failed to create space");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Space</DialogTitle>
          <DialogDescription>
            Start a live audio conversation with your followers
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What would you like to talk about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a brief description of your Space"
              className="resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="scheduled">Schedule for later</Label>
            <Switch
              id="scheduled"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
          </div>

          {isScheduled && (
            <div className="flex flex-col space-y-2">
              <Label>Select date and time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP p") : "Select date and time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                  {/* Time selection would ideally go here */}
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="recorded" className="block">Record Space</Label>
              <p className="text-xs text-muted-foreground">Make a replay available after the Space ends</p>
            </div>
            <Switch
              id="recorded"
              checked={isRecorded}
              onCheckedChange={setIsRecorded}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSpace}
            disabled={isSubmitting}
          >
            {isScheduled ? "Schedule" : "Start now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
