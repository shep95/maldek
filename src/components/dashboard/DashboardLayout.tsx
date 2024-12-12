import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { CreatePostDialog } from "./CreatePostDialog";
import { useSession } from '@supabase/auth-helpers-react';
import { Author } from "@/utils/postUtils";

const DashboardLayout = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const session = useSession();

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: '',
    avatar_url: '',
    name: ''
  };

  const handlePostCreated = (newPost: any) => {
    console.log('New post created:', newPost);
    setIsCreatingPost(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar setIsCreatingPost={setIsCreatingPost} />
      <div className="md:pl-64">
        <main className="min-h-screen pb-20 md:pb-0 px-4">
          <div className="max-w-3xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <CreatePostDialog
        isOpen={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        currentUser={currentUser}
        onPostCreated={handlePostCreated}
      />
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;