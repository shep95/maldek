
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContinentSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const continents = [
  { value: "north_america", label: "North America" },
  { value: "south_america", label: "South America" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
  { value: "oceania", label: "Oceania" },
  { value: "global", label: "Global" },
];

export const ContinentSelectionDialog = ({
  isOpen,
  onOpenChange,
}: ContinentSelectionDialogProps) => {
  const [selectedContinent, setSelectedContinent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedContinent) {
      toast.error("Please select a continent");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          continent: selectedContinent,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Continent preference saved");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving continent:', error);
      toast.error("Failed to save continent preference");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Continent</DialogTitle>
          <DialogDescription>
            Choose your continent to see relevant posts from your region. You can change this later in settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select
            value={selectedContinent}
            onValueChange={setSelectedContinent}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your continent" />
            </SelectTrigger>
            <SelectContent>
              {continents.map((continent) => (
                <SelectItem key={continent.value} value={continent.value}>
                  {continent.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={isLoading || !selectedContinent}
          >
            {isLoading ? "Saving..." : "Save Preference"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
