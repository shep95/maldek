
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";
import { Pencil } from "lucide-react";
import { SecurityCodeDialog } from "@/components/settings/SecurityCodeDialog";

interface EditProfileDialogProps {
  profile: any;
  onProfileUpdate: () => void;
}

export const EditProfileDialog = ({ profile, onProfileUpdate }: EditProfileDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{bio?: string, avatarUrl?: string}>(null);

  // Load saved bio from localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      const savedBio = localStorage.getItem(`bio_draft_${profile?.id}`);
      setBio(savedBio || profile?.bio || "");
    }
  }, [isOpen, profile?.id, profile?.bio]);

  // Save bio to localStorage when it changes
  useEffect(() => {
    if (bio) {
      localStorage.setItem(`bio_draft_${profile?.id}`, bio);
    }
  }, [bio, profile?.id]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Starting avatar upload for user:', profile.id);
      const imageUrl = await handleImageUpload(file, profile.id);
      
      if (imageUrl) {
        setPendingChanges({ ...pendingChanges, avatarUrl: imageUrl });
        setAvatarUrl(imageUrl);
        setIsVerifyingCode(true);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload profile picture");
    }
  };

  const handleBioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingChanges({ ...pendingChanges, bio });
    setIsVerifyingCode(true);
  };

  const handleVerificationSuccess = async (securityCode: string) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc('update_profile_with_code', {
        p_avatar_url: pendingChanges?.avatarUrl || null,
        p_bio: pendingChanges?.bio || null,
        p_security_code: securityCode
      });

      if (error) throw error;

      // Clear saved draft after successful update
      localStorage.removeItem(`bio_draft_${profile?.id}`);
      setPendingChanges(null);
      
      toast.success("Profile updated successfully");
      onProfileUpdate();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
      setIsVerifyingCode(false);
    }
  };

  const handleClose = () => {
    // Keep the draft in localStorage when closing
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
            Edit Profile
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBioSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 p-1 bg-accent text-white rounded-full cursor-pointer hover:bg-accent/90"
                >
                  <Pencil className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                minLength={3}
                readOnly // Username can't be changed
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="h-32"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SecurityCodeDialog
        isOpen={isVerifyingCode}
        onOpenChange={setIsVerifyingCode}
        action="verify"
        onSuccess={handleVerificationSuccess}
      />
    </>
  );
};
