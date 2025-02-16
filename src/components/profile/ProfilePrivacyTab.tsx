
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lock, Shield, Key, Upload, File } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type PrivateData = Database['public']['Tables']['private_data']['Row'];
type PrivatePost = Database['public']['Tables']['private_posts']['Row'];

interface ProfilePrivacyTabProps {
  userId: string;
}

export const ProfilePrivacyTab = ({ userId }: ProfilePrivacyTabProps) => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const { data: privateData } = useQuery({
    queryKey: ['private-data', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('private_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching private data:', error);
        return null;
      }
      return data;
    }
  });

  const { data: privatePosts } = useQuery({
    queryKey: ['private-posts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('private_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching private posts:', error);
        return [];
      }
      return data;
    }
  });

  const updateSecurityCode = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc(
        'update_security_code',
        { old_code: currentCode, new_code: newCode }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Security code updated successfully');
      setCurrentCode('');
      setNewCode('');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Error updating security code:', error);
      toast.error('Failed to update security code. Please check your current code.');
    }
  });

  const createPrivatePost = useMutation({
    mutationFn: async () => {
      const mediaUrls: string[] = [];

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('private-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('private-files')
            .getPublicUrl(filePath);

          mediaUrls.push(publicUrl);
        }
      }

      const { error } = await supabase
        .from('private_posts')
        .insert({
          user_id: userId,
          content,
          encrypted_title: title,
          media_urls: mediaUrls
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Private post created successfully');
      setTitle('');
      setContent('');
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ['private-posts'] });
    },
    onError: (error) => {
      console.error('Error creating private post:', error);
      toast.error('Failed to create private post');
    }
  });

  const handleUpdateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.length !== 4 || !/^\d{4}$/.test(newCode)) {
      toast.error('New security code must be exactly 4 digits');
      return;
    }
    updateSecurityCode.mutate();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    createPrivatePost.mutate();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-background/20 backdrop-blur-lg border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Privacy Settings</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your security code and private data. Your security code is required to access sensitive information and make important changes to your account.
        </p>

        <form onSubmit={handleUpdateCode} className="space-y-4">
          <div>
            <label htmlFor="currentCode" className="block text-sm font-medium mb-2">
              Current Security Code
            </label>
            <Input
              id="currentCode"
              type="password"
              placeholder="Enter current code"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              maxLength={4}
              className="bg-background/10"
            />
          </div>

          <div>
            <label htmlFor="newCode" className="block text-sm font-medium mb-2">
              New Security Code
            </label>
            <Input
              id="newCode"
              type="password"
              placeholder="Enter new code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              maxLength={4}
              className="bg-background/10"
            />
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={updateSecurityCode.isPending}
          >
            {updateSecurityCode.isPending ? 'Updating...' : 'Update Security Code'}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-background/20 backdrop-blur-lg border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Private Posts</h2>
        </div>
        
        <form onSubmit={handleCreatePost} className="space-y-4 mb-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title (Optional)
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="bg-background/10"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your private post..."
              className="bg-background/10 min-h-[100px]"
            />
          </div>

          <div>
            <label htmlFor="files" className="block text-sm font-medium mb-2">
              Attach Files
            </label>
            <Input
              id="files"
              type="file"
              onChange={handleFileSelect}
              multiple
              className="bg-background/10"
            />
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <File className="w-4 h-4" />
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={createPrivatePost.isPending}
          >
            {createPrivatePost.isPending ? (
              <>Creating post...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Create Private Post
              </>
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Private Posts</h3>
          {privatePosts?.map((post) => (
            <div key={post.id} className="p-4 rounded-lg bg-background/5">
              {post.encrypted_title && (
                <h4 className="font-medium mb-2">{post.encrypted_title}</h4>
              )}
              <p className="text-sm text-muted-foreground">{post.content}</p>
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="mt-3 space-y-2">
                  {post.media_urls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-accent hover:underline"
                    >
                      <File className="w-4 h-4" />
                      Attached File {index + 1}
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
