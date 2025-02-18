
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ShieldAlert } from "lucide-react";

interface ProfilePrivacyTabProps {
  userId: string;
}

export const ProfilePrivacyTab = ({ userId }: ProfilePrivacyTabProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isChangingCode, setIsChangingCode] = useState(false);
  const [newSecurityCode, setNewSecurityCode] = useState("");
  const [oldSecurityCode, setOldSecurityCode] = useState("");

  const handleSecurityCodeChange = async () => {
    if (newSecurityCode.length !== 4 || !/^\d{4}$/.test(newSecurityCode)) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('update_security_code', {
          old_code: oldSecurityCode,
          new_code: newSecurityCode
        });

      if (error) throw error;

      if (!data) {
        toast.error("Invalid old security code");
        return;
      }
      
      toast.success("Security code updated successfully");
      setNewSecurityCode("");
      setOldSecurityCode("");
      setIsChangingCode(false);
    } catch (error) {
      console.error('Error changing security code:', error);
      toast.error("Failed to change security code");
    }
  };

  const handleSetSecurityCode = async () => {
    if (newSecurityCode.length !== 4 || !/^\d{4}$/.test(newSecurityCode)) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ security_code: newSecurityCode })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success("Security code set successfully");
      setNewSecurityCode("");
      setIsChangingCode(false);
    } catch (error) {
      console.error('Error setting security code:', error);
      toast.error("Failed to set security code");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

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

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-semibold">Security Code</h2>
        </div>
        
        <div className="space-y-4 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            {isChangingCode ? (
              "Enter your old security code and set a new one. You can only use 4 digits."
            ) : (
              "Create or change your security code. You can only use 4 digits and they must be numbers."
            )}
            <br /><br />
            <span className="font-bold text-destructive">
              Warning: If you lose your code, you will lose access to your account.
            </span>
          </p>

          {isChangingCode && (
            <Input
              type="password"
              placeholder="Enter old 4-digit code"
              value={oldSecurityCode}
              onChange={(e) => setOldSecurityCode(e.target.value)}
              maxLength={4}
              pattern="\d{4}"
              required
              className="text-center text-2xl tracking-widest"
            />
          )}

          <Input
            type="password"
            placeholder="Enter new 4-digit code"
            value={newSecurityCode}
            onChange={(e) => setNewSecurityCode(e.target.value)}
            maxLength={4}
            pattern="\d{4}"
            required
            className="text-center text-2xl tracking-widest"
          />

          <div className="space-y-2">
            <Button 
              onClick={isChangingCode ? handleChangeSecurityCode : handleSetSecurityCode} 
              className="w-full"
              disabled={
                newSecurityCode.length !== 4 || 
                !/^\d{4}$/.test(newSecurityCode) ||
                (isChangingCode && (oldSecurityCode.length !== 4 || !/^\d{4}$/.test(oldSecurityCode)))
              }
            >
              {isChangingCode ? "Change Security Code" : "Set Security Code"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                setIsChangingCode(!isChangingCode);
                setNewSecurityCode("");
                setOldSecurityCode("");
              }}
              className="w-full"
            >
              {isChangingCode ? "Cancel" : "Change Existing Code"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
