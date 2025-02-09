
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

const continents = [
  { value: "north_america", label: "North America" },
  { value: "south_america", label: "South America" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
  { value: "oceania", label: "Oceania" },
  { value: "global", label: "Global" },
];

export const ContinentSection = () => {
  const [selectedContinent, setSelectedContinent] = useState<string>("");
  const session = useSession();

  useEffect(() => {
    const fetchContinent = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('continent')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching continent setting:', error);
        return;
      }

      if (data?.continent) {
        setSelectedContinent(data.continent);
      }
    };

    fetchContinent();
  }, [session?.user?.id]);

  const handleContinentChange = async (continent: string) => {
    try {
      if (!session?.user?.id) {
        toast.error("You must be logged in to change settings");
        return;
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          continent: continent,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSelectedContinent(continent);
      toast.success("Continent preference updated");
    } catch (error) {
      console.error('Error updating continent:', error);
      toast.error("Failed to update continent preference");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Region Settings</CardTitle>
        <CardDescription>Choose your continent to see posts from your region</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedContinent} onValueChange={handleContinentChange}>
          <SelectTrigger className="w-full">
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
      </CardContent>
    </Card>
  );
};
