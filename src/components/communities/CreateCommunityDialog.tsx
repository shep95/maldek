import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Upload } from "lucide-react";

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  description: string;
  avatar_url?: string;
}

export const CreateCommunityDialog = ({ open, onOpenChange }: CreateCommunityDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    console.log('Creating community:', data);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      let avatar_url = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('posts')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        avatar_url = publicUrl;
      }

      const { data: newCommunity, error } = await supabase
        .from('communities')
        .insert({
          name: data.name,
          description: data.description,
          creator_id: user.id,
          avatar_url,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: newCommunity.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      console.log('Community created:', newCommunity);
      toast.success('Community created successfully!');
      reset();
      setAvatarFile(null);
      setAvatarPreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Community</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 cursor-pointer relative group">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback>
                <Users className="w-12 h-12" />
              </AvatarFallback>
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Click to upload community avatar
            </span>
          </div>

          <div>
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="Enter community name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your community..."
              className="h-32"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};