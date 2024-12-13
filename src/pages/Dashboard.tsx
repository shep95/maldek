import { useState } from "react";
import { useSession } from '@supabase/auth-helpers-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreatePostDialog } from "@/components/dashboard/CreatePostDialog";
import { PostList } from "@/components/dashboard/PostList";
import { Author } from "@/utils/postUtils";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const session = useSession();

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        toast.error('Error loading profile');
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id
  });

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: profile?.username || '',
    avatar_url: profile?.avatar_url || '',
    name: profile?.username || ''
  };

  const handlePostCreated = () => {
    setIsCreatingPost(false);
    toast.success('Post created successfully!');
  };

  console.log('Dashboard render - isCreatingPost:', isCreatingPost);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center">
        <main className="w-full max-w-3xl px-4 py-6 md:py-8 md:pl-24 animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Home</h1>
          <PostList />
        </main>
      </div>

      <CreatePostDialog
        isOpen={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        currentUser={currentUser}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Dashboard;