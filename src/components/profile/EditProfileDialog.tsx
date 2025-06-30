
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";
import { Pencil, Camera } from "lucide-react";

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
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || "");

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

    // Show file size warning if over 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.info(`Uploading a large image (${(file.size / (1024 * 1024)).toFixed(1)}MB). This might take a moment.`);
    }

    try {
      console.log('Starting avatar upload for user:', profile.id);
      const imageUrl = await handleImageUpload(file, profile.id);
      
      if (imageUrl) {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: imageUrl })
          .eq('id', profile.id);

        if (error) throw error;

        setAvatarUrl(imageUrl);
        onProfileUpdate();
        toast.success("Profile picture updated successfully");
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload profile picture");
    }
  };

  const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show file size warning if over 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.info(`Uploading a large image (${(file.size / (1024 * 1024)).toFixed(1)}MB). This might take a moment.`);
    }

    try {
      console.log('Starting banner upload for user:', profile.id);
      const imageUrl = await handleImageUpload(file, profile.id);
      
      if (imageUrl) {
        const { error } = await supabase
          .from('profiles')
          .update({ banner_url: imageUrl })
          .eq('id', profile.id);

        if (error) throw error;

        setBannerUrl(imageUrl);
        onProfileUpdate();
        toast.success("Banner updated successfully");
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error("Failed to upload banner");
    }
  };

  const handleBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', profile.id);

      if (error) throw error;

      // Clear saved draft after successful update
      localStorage.removeItem(`bio_draft_${profile?.id}`);
      
      toast.success("Profile updated successfully");
      onProfileUpdate();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleBioSubmit} className="space-y-4">
          {/* Banner Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Banner</label>
            <div className="relative">
              <div 
                className="h-32 w-full bg-cover bg-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                style={{ 
                  backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
                  backgroundColor: bannerUrl ? 'transparent' : 'rgba(44, 47, 63, 0.3)'
                }}
              >
                <label 
                  htmlFor="banner-upload" 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors rounded-lg"
                >
                  <Camera className="h-8 w-8 text-white" />
                </label>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended size: 1500x500px. Supports JPEG, PNG, GIF, WebP (up to 20MB)
              </p>
            </div>
          </div>

          {/* Avatar Upload Section */}
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
            <p className="text-xs text-muted-foreground">
              Supports JPEG, PNG, GIF, WebP (up to 20MB)
            </p>
          </div>

          {/* Username Field */}
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
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Bio Field */}
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
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
  );
};
