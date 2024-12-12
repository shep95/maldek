import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  username: string;
  avatarUrl: string | null;
  isCurrentUser: boolean;
  onEditClick: () => void;
  isEditing: boolean;
}

export const ProfileHeader = ({
  username,
  avatarUrl,
  isCurrentUser,
  onEditClick,
  isEditing
}: ProfileHeaderProps) => {
  return (
    <>
      <div className="pt-6">
        <div className="relative h-48 rounded-xl bg-gradient-to-r from-[#1a1f2c] to-[#6E59A5] overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="absolute bottom-0 left-6 transform translate-y-2/3 animate-fade-in">
            <Avatar className="h-32 w-32 rounded-xl border-4 border-background shadow-lg ring-2 ring-accent/50">
              <AvatarImage src={avatarUrl || ''} alt={username} />
              <AvatarFallback className="bg-accent/10 text-2xl rounded-xl">{username?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          {isCurrentUser && (
            <div className="absolute right-4 top-4 flex gap-2 animate-fade-in">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-background/10 backdrop-blur hover:bg-background/20 transition-all duration-300"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add banner
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-background/10 backdrop-blur hover:bg-background/20 transition-all duration-300"
                onClick={onEditClick}
              >
                {isEditing ? "Cancel" : "Edit profile"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};