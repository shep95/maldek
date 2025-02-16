import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lock, Shield, Key, Upload, File, Eye, SortDesc, SortAsc, Image as ImageIcon } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaPreviewDialog } from '@/components/dashboard/MediaPreviewDialog';

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
  const [accessCode, setAccessCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const SecurityCodeSection = () => {
    return (
      <Card className="p-6 bg-background/20 backdrop-blur-lg border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Privacy Settings</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {!userProfile?.security_code 
            ? "Set up your security code to protect your private data. This code will be required to access sensitive information. If you don't have a security code yet, you can create one in the settings tab."
            : "Manage your security code and private data. Your security code is required to access sensitive information and make important changes to your account. Keep this code safe - if you lose it, you won't be able to access your private data."
          }
        </p>

        {!userProfile?.security_code ? (
          <form onSubmit={handleSetInitialCode} className="space-y-4">
            <div>
              <label htmlFor="newCode" className="block text-sm font-medium mb-2">
                Create Security Code
              </label>
              <Input
                id="newCode"
                type="password"
                placeholder="Enter 4-digit code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                maxLength={4}
                className="bg-background/10"
              />
            </div>

            <Button 
              type="submit"
              className="w-full"
              disabled={setInitialSecurityCode.isPending}
            >
              {setInitialSecurityCode.isPending ? 'Setting code...' : 'Set Security Code'}
            </Button>
          </form>
        ) : (
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
        )}
      </Card>
    );
  };

  const { data: userProfile } = useQuery({
    queryKey: ['user-security-code', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('security_code')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: privatePosts, refetch: refetchPrivatePosts } = useQuery({
    queryKey: ['private-posts', userId, isVerified, sortOrder],
    queryFn: async () => {
      if (!isVerified) return [];
      
      const { data, error } = await supabase
        .from('private_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (error) {
        console.error('Error fetching private posts:', error);
        setIsVerified(false);
        return [];
      }
      return data || [];
    },
    enabled: isVerified
  });

  const verifySecurityCode = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('get_private_data_with_code', { code: accessCode });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsVerified(true);
      refetchPrivatePosts();
      toast.success('Security code verified successfully');
    },
    onError: (error) => {
      console.error('Error verifying security code:', error);
      toast.error('Invalid security code');
      setIsVerified(false);
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

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('private-files')
            .upload(filePath, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            throw new Error(`Failed to upload file: ${uploadError.message}`);
          }

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
      refetchPrivatePosts();
    },
    onError: (error) => {
      console.error('Error creating private post:', error);
      toast.error('Failed to create private post');
    }
  });

  const setInitialSecurityCode = useMutation({
    mutationFn: async () => {
      if (newCode.length !== 4 || !/^\d{4}$/.test(newCode)) {
        throw new Error('Security code must be exactly 4 digits');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ security_code: newCode })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Security code set successfully');
      setNewCode('');
      queryClient.invalidateQueries({ queryKey: ['user-security-code'] });
    },
    onError: (error) => {
      console.error('Error setting security code:', error);
      toast.error('Failed to set security code');
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

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.length !== 4 || !/^\d{4}$/.test(accessCode)) {
      toast.error('Please enter a valid 4-digit security code');
      return;
    }
    verifySecurityCode.mutate();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error('Please verify your security code first');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    createPrivatePost.mutate();
  };

  const handleSetInitialCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.length !== 4 || !/^\d{4}$/.test(newCode)) {
      toast.error('Security code must be exactly 4 digits');
      return;
    }
    setInitialSecurityCode.mutate();
  };

  return (
    <div className="space-y-6">
      <SecurityCodeSection />
      
      {userProfile?.security_code && (
        <Card className="p-6 bg-background/20 backdrop-blur-lg border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Private Posts</h2>
            </div>
            {isVerified && (
              <Select 
                value={sortOrder} 
                onValueChange={(value: 'desc' | 'asc') => setSortOrder(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Newest first
                    </div>
                  </SelectItem>
                  <SelectItem value="asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Oldest first
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {!isVerified ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="accessCode" className="block text-sm font-medium mb-2">
                  Enter Security Code to Access Private Posts
                </label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Enter 4-digit code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  maxLength={4}
                  className="bg-background/10"
                />
              </div>
              <Button 
                type="submit"
                className="w-full"
                disabled={verifySecurityCode.isPending}
              >
                {verifySecurityCode.isPending ? (
                  <>Verifying...</>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Access Private Posts
                  </>
                )}
              </Button>
            </form>
          ) : (
            <>
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
                    accept="image/*"
                    className="bg-background/10"
                  />
                  {files.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Your Private Posts</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVerified(false)}
                  >
                    Lock
                  </Button>
                </div>
                {privatePosts?.map((post) => (
                  <div key={post.id} className="p-4 rounded-lg bg-background/5 space-y-4">
                    {post.encrypted_title && (
                      <h4 className="font-medium mb-2">{post.encrypted_title}</h4>
                    )}
                    <p className="text-sm text-muted-foreground">{post.content}</p>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {post.media_urls.map((url, index) => (
                          <div 
                            key={index} 
                            className="relative aspect-video cursor-pointer group"
                            onClick={() => setSelectedMedia(url)}
                          >
                            <img
                              src={url}
                              alt={`Attachment ${index + 1}`}
                              className="rounded-lg object-cover w-full h-full transition-transform duration-200 group-hover:scale-[1.02]"
                              onContextMenu={(e) => e.preventDefault()}
                              style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()} at{' '}
                      {new Date(post.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      <MediaPreviewDialog
        selectedMedia={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
};
