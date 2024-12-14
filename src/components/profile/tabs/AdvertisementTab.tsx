import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateAdDialog } from "@/components/advertisements/CreateAdDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Play, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdvertisementTabProps {
  userId: string;
}

export const AdvertisementTab = ({ userId }: AdvertisementTabProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const { data: advertisements, isLoading } = useQuery({
    queryKey: ['advertisements', userId],
    queryFn: async () => {
      console.log('Fetching advertisements for user:', userId);
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching advertisements:', error);
        throw error;
      }

      console.log('Fetched advertisements:', data);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Advertisements</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Ad
        </Button>
      </div>

      {advertisements?.length === 0 ? (
        <Card className="p-8 text-center space-y-4">
          <Play className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium">No advertisements yet</h3>
          <p className="text-muted-foreground">
            Create your first video advertisement to reach more viewers
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Ad
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {advertisements?.map((ad) => (
            <Card key={ad.id} className="p-4">
              <div className="flex items-center gap-4">
                {ad.thumbnail_url && (
                  <img
                    src={ad.thumbnail_url}
                    alt={ad.title}
                    className="h-20 w-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{ad.title}</h3>
                  <p className="text-sm text-muted-foreground">{ad.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Budget: ${ad.budget}
                    </span>
                    <span className="text-sm">Duration: {ad.duration}s</span>
                    <span className={`text-sm capitalize ${
                      ad.status === 'active' ? 'text-green-500' :
                      ad.status === 'pending' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateAdDialog
        isOpen={isCreating}
        onOpenChange={setIsCreating}
      />
    </div>
  );
};