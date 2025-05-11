
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useFollowStatus } from "./hooks/useFollowStatus";
import { useToast } from "@/hooks/use-toast";

interface NewMessageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string, username: string, isFollowing: boolean) => void;
}

export const NewMessageDialog: React.FC<NewMessageDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onSelectUser
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const session = useSession();
  const currentUserId = session?.user?.id;
  const { checkFollowStatus } = useFollowStatus();
  const { toast } = useToast();

  // Search for users based on the query
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', currentUserId || '')
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        toast.error("Failed to search users");
        return [];
      }

      return data;
    },
    enabled: searchQuery.length >= 2,
  });

  const handleUserSelect = async (userId: string, username: string) => {
    const isFollowing = await checkFollowStatus(userId);
    onSelectUser(userId, username, isFollowing);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedUserId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mobile-dialog-content max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Search for a user to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-[14px] h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by username..." 
            className="pl-9 min-h-[44px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-60 overflow-y-auto hide-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
            <p className="text-center py-4 text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-1 mt-2">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  className={`w-full flex items-center gap-3 p-4 rounded-md hover:bg-accent text-left transition-colors touch-target ${
                    selectedUserId === user.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleUserSelect(user.id, user.username)}
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="font-medium">
                      {user.username[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
