import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  userId: string;
  type: 'avatar' | 'banner';
  currentUrl: string | null;
  onUploadComplete: (url: string) => void;
}

export const ImageUpload = ({ userId, type, currentUrl, onUploadComplete }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setIsUploading(true);
      console.log(`Uploading ${type} for user:`, userId);

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${type}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error(`${type} upload error:`, uploadError);
        toast.error(`Failed to upload ${type}`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log(`${type} uploaded successfully:`, publicUrl);

      const updateData = type === 'avatar' 
        ? { avatar_url: publicUrl }
        : { banner_url: publicUrl };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        console.error(`Error updating ${type}:`, updateError);
        toast.error(`Failed to update ${type}`);
        return;
      }

      onUploadComplete(publicUrl);
      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Banner'} updated successfully`);
    } catch (error) {
      console.error(`${type} upload error:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id={`${type}-upload`}
      />
      <Button
        variant="outline"
        size="sm"
        className="bg-background/10 backdrop-blur hover:bg-background/20 transition-all duration-300"
        disabled={isUploading}
        onClick={() => document.getElementById(`${type}-upload`)?.click()}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            {type === 'avatar' ? 'Change profile picture' : 'Change banner'}
          </>
        )}
      </Button>
    </div>
  );
};