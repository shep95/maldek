import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const BackgroundImageSection = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: backgroundImage } = useQuery({
    queryKey: ['background-image', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('user_background_images')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      return data;
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    try {
      setIsUploading(true);
      console.log('Starting image upload:', file.name);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading to path:', filePath);

      // Upload image to storage
      const { error: uploadError, data } = await supabase.storage
        .from('background-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, getting public URL');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('background-images')
        .getPublicUrl(filePath);

      console.log('Public URL obtained:', publicUrl);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_background_images')
        .upsert({
          user_id: session.user.id,
          image_url: publicUrl,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      queryClient.invalidateQueries({ queryKey: ['background-image'] });
      toast.success('Background image updated successfully');

      // Apply background immediately
      document.body.style.backgroundImage = `url(${publicUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } catch (error) {
      console.error('Error uploading background image:', error);
      toast.error('Failed to upload background image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeBackground = async () => {
    if (!session?.user?.id || !backgroundImage) return;

    try {
      // Extract filename from URL
      const urlParts = backgroundImage.image_url.split('/');
      const filePath = `${session.user.id}/${urlParts[urlParts.length - 1]}`;

      console.log('Removing file from path:', filePath);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('background-images')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_background_images')
        .delete()
        .eq('user_id', session.user.id);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw dbError;
      }

      queryClient.invalidateQueries({ queryKey: ['background-image'] });
      toast.success('Background image removed');

      // Remove background
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = 'var(--background)';
    } catch (error) {
      console.error('Error removing background image:', error);
      toast.error('Failed to remove background image');
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Background Image</h2>
      <p className="text-sm text-muted-foreground">
        Upload a custom background image for your app
      </p>
      
      {backgroundImage?.image_url && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden">
          <img
            src={backgroundImage.image_url}
            alt="Current background"
            className="w-full h-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeBackground}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => document.getElementById('background-upload')?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </div>

      <input
        type="file"
        id="background-upload"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </Card>
  );
};