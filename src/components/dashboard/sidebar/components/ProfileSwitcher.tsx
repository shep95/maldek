
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { SwitchCamera, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  profile_type: 'primary' | 'secondary';
}

export const ProfileSwitcher = ({ collapsed }: { collapsed?: boolean }) => {
  const { toast } = useToast();
  const session = useSession();
  const [isCreating, setIsCreating] = useState(false);

  const { data: profiles, refetch } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      const { data: primaryProfile, error: primaryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (primaryError) throw primaryError;

      const { data: secondaryProfile, error: secondaryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('primary_profile_id', session?.user?.id)
        .maybeSingle();

      if (secondaryError) throw secondaryError;

      return [primaryProfile, secondaryProfile].filter(Boolean) as Profile[];
    },
    enabled: !!session?.user?.id
  });

  const handleCreateSecondaryProfile = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('primary_profile_id', session?.user?.id);

      if (existingProfiles && existingProfiles.length >= 1) {
        toast({
          title: "Profile limit reached",
          description: "You can only have two profiles.",
          variant: "destructive"
        });
        return;
      }

      const newUsername = `${session?.user?.email?.split('@')[0]}_2`;
      
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          username: newUsername,
          primary_profile_id: session?.user?.id,
          profile_type: 'secondary'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Secondary profile created.",
      });

      refetch();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create secondary profile.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchProfile = async (profileId: string) => {
    try {
      // Store the current profile in localStorage
      localStorage.setItem('current_profile_id', profileId);
      
      // Refresh the page to apply the profile switch
      window.location.reload();
    } catch (error) {
      console.error('Error switching profile:', error);
      toast({
        title: "Error",
        description: "Failed to switch profile.",
        variant: "destructive"
      });
    }
  };

  if (!profiles) return null;

  const currentProfileId = localStorage.getItem('current_profile_id') || session?.user?.id;
  const currentProfile = profiles.find(p => p.id === currentProfileId);
  const otherProfile = profiles.find(p => p.id !== currentProfileId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 relative group transition-all duration-300 hover:bg-white/5 hover:backdrop-blur-lg ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <SwitchCamera className="h-4 w-4" />
          {!collapsed && (
            <>
              <span>Switch Profile</span>
              {currentProfile && (
                <span className="ml-auto text-xs opacity-50">
                  @{currentProfile.username}
                </span>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {profiles.map((profile) => (
          <DropdownMenuItem
            key={profile.id}
            onClick={() => handleSwitchProfile(profile.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>@{profile.username}</span>
            {profile.id === currentProfileId && (
              <span className="ml-auto text-xs opacity-50">Active</span>
            )}
          </DropdownMenuItem>
        ))}
        {profiles.length < 2 && (
          <DropdownMenuItem
            onClick={handleCreateSecondaryProfile}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Profile</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
