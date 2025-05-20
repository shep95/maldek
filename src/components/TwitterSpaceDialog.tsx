
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TwitterSpaceUI } from "./spaces/TwitterSpaceUI";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TwitterSpaceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
}

export const TwitterSpaceDialog = ({
  isOpen,
  onOpenChange,
  spaceId
}: TwitterSpaceDialogProps) => {
  // Fetch space details
  const { data: space } = useQuery({
    queryKey: ['space-details', spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          host:profiles!spaces_host_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', spaceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!spaceId && isOpen
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-0 bg-transparent">
        {space && (
          <TwitterSpaceUI
            spaceId={space.id}
            spaceName={space.title}
            spaceDescription={space.description}
            hostId={space.host_id}
            hostName={space.host?.username || 'Unknown'}
            hostAvatar={space.host?.avatar_url}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
