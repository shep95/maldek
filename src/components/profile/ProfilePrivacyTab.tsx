
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfilePrivacyTabProps {
  userId: string;
}

export const ProfilePrivacyTab = ({ userId }: ProfilePrivacyTabProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl.publicUrl);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBioUpdate = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Bio updated successfully");
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error("Failed to update bio");
    }
  };

  // Fetch current profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("bio, avatar_url")
          .eq("id", userId)
          .single();

        if (error) throw error;
        if (data) {
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfileData();
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Profile Picture</Label>
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="max-w-[250px]"
            disabled={isUploading}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          className="min-h-[100px]"
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground">
          {bio.length}/500 characters
        </p>
        <Button onClick={handleBioUpdate}>
          Save Bio
        </Button>
      </div>
    </div>
  );
};
