import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ShieldAlert, Lock, Folder, Upload, Plus } from "lucide-react";
import { SecurityCodeDialog } from "@/components/settings/SecurityCodeDialog";

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
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const [privateData, setPrivateData] = useState<any[]>([]);
  const [isPrivateDataVisible, setIsPrivateDataVisible] = useState(false);
  const [newPrivateTitle, setNewPrivateTitle] = useState("");
  const [newPrivateContent, setNewPrivateContent] = useState("");
  const [newPrivateFiles, setNewPrivateFiles] = useState<File[]>([]);
  const [isCreatingPrivatePost, setIsCreatingPrivatePost] = useState(false);

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

  const handleSecurityCodeVerification = async (code: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_private_data_with_code', { code });

      if (error) throw error;

      setPrivateData(data || []);
      setIsPrivateDataVisible(true);
      setIsSecurityDialogOpen(false);
      toast.success("Private data accessed successfully");
    } catch (error) {
      console.error('Error accessing private data:', error);
      toast.error("Failed to access private data");
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

  const handlePrivateFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewPrivateFiles(prevFiles => [...prevFiles, ...files]);
  };

  const handleCreatePrivatePost = async () => {
    if (!newPrivateTitle.trim() && !newPrivateContent.trim()) {
      toast.error("Please add a title or content");
      return;
    }

    try {
      setIsUploading(true);
      const mediaUrls: string[] = [];

      if (newPrivateFiles.length > 0) {
        for (const file of newPrivateFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
          const filePath = `private-files/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('private-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrl } = supabase.storage
            .from('private-files')
            .getPublicUrl(filePath);

          mediaUrls.push(publicUrl.publicUrl);
        }
      }

      const { error } = await supabase
        .from('private_posts')
        .insert({
          user_id: userId,
          encrypted_title: newPrivateTitle,
          content: newPrivateContent,
          media_urls: mediaUrls
        });

      if (error) throw error;

      toast.success("Private post created successfully");
      setNewPrivateTitle("");
      setNewPrivateContent("");
      setNewPrivateFiles([]);
      setIsCreatingPrivatePost(false);

      if (isPrivateDataVisible) {
        const { data, error: refreshError } = await supabase
          .from('private_posts')
          .select('*')
          .eq('user_id', userId);

        if (!refreshError && data) {
          setPrivateData(data);
        }
      }
    } catch (error) {
      console.error('Error creating private post:', error);
      toast.error("Failed to create private post");
    } finally {
      setIsUploading(false);
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
              onClick={isChangingCode ? handleSecurityCodeChange : handleSetSecurityCode} 
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Private Folder</h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsCreatingPrivatePost(true)}
                className="gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                New Private Post
              </Button>
              <Button
                onClick={() => setIsSecurityDialogOpen(true)}
                className="gap-2"
                variant="outline"
              >
                <Lock className="h-4 w-4" />
                Access Private Data
              </Button>
            </div>
          </div>

          {isCreatingPrivatePost && (
            <div className="space-y-4 rounded-lg border p-4">
              <Input
                placeholder="Title (optional)"
                value={newPrivateTitle}
                onChange={(e) => setNewPrivateTitle(e.target.value)}
              />
              <Textarea
                placeholder="Content"
                value={newPrivateContent}
                onChange={(e) => setNewPrivateContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="space-y-2">
                <Label>Attach Files (Optional)</Label>
                <Input
                  type="file"
                  onChange={handlePrivateFileUpload}
                  multiple
                  className="cursor-pointer"
                />
                {newPrivateFiles.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {newPrivateFiles.length} file(s) selected
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreatingPrivatePost(false);
                    setNewPrivateTitle("");
                    setNewPrivateContent("");
                    setNewPrivateFiles([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePrivatePost}
                  disabled={isUploading}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Create Private Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {isPrivateDataVisible && privateData.length > 0 && (
            <div className="space-y-4 rounded-lg border p-4">
              {privateData.map((item) => (
                <div key={item.id} className="space-y-2">
                  <h3 className="font-medium">{item.encrypted_title || 'Untitled'}</h3>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                  {item.media_urls?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.media_urls.map((url: string, index: number) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Private media ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SecurityCodeDialog
        isOpen={isSecurityDialogOpen}
        onOpenChange={setIsSecurityDialogOpen}
        action="verify"
        onSuccess={handleSecurityCodeVerification}
      />
    </div>
  );
};
