import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MentionInputProps {
  mentionedUser: string;
  onMentionChange: (value: string) => void;
  onMentionSubmit: () => void;
}

export const MentionInput = ({
  mentionedUser,
  onMentionChange,
  onMentionSubmit
}: MentionInputProps) => {
  const [userSuggestions, setUserSuggestions] = useState<Array<{
    id: string;
    username: string;
    avatar_url: string | null;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (mentionedUser.startsWith('@')) {
        const searchTerm = mentionedUser.slice(1);
        console.log('Fetching users for search term:', searchTerm);
        
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .ilike('username', `%${searchTerm}%`)
          .limit(5);

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        console.log('Found users:', users);
        setUserSuggestions(users || []);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    };

    fetchUsers();
  }, [mentionedUser]);

  const handleSelectUser = (username: string) => {
    onMentionChange(`@${username}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Mention a user"
          value={mentionedUser}
          onChange={(e) => onMentionChange(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={onMentionSubmit}
          className="shrink-0"
        >
          <AtSign className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && userSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <ScrollArea className="max-h-48">
            {userSuggestions.map((user) => (
              <button
                key={user.id}
                className="w-full px-4 py-2 text-left hover:bg-accent/50 flex items-center gap-2"
                onClick={() => handleSelectUser(user.username)}
              >
                {user.avatar_url && (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>@{user.username}</span>
              </button>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};