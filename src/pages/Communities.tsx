import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Users } from "lucide-react";
import { CreateCommunityDialog } from "@/components/communities/CreateCommunityDialog";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Communities = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  const { data: communities, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trending-communities'],
    queryFn: async () => {
      console.log('Fetching trending communities');
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          creator:profiles!communities_creator_id_fkey(username, avatar_url),
          members:community_members(count)
        `)
        .order('trending_score', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching communities:', error);
        toast.error('Failed to load communities');
        throw error;
      }

      return data;
    }
  });

  const { data: joinedCommunities, isLoading: isJoinedLoading } = useQuery({
    queryKey: ['joined-communities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('community_members')
        .select(`
          community:communities (
            *,
            creator:profiles!communities_creator_id_fkey(username, avatar_url),
            members:community_members(count)
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching joined communities:', error);
        toast.error('Failed to load joined communities');
        throw error;
      }

      return data.map(item => item.community);
    }
  });

  const { data: ownedCommunities, isLoading: isOwnedLoading } = useQuery({
    queryKey: ['owned-communities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          creator:profiles!communities_creator_id_fkey(username, avatar_url),
          members:community_members(count)
        `)
        .eq('creator_id', user.id);

      if (error) {
        console.error('Error fetching owned communities:', error);
        toast.error('Failed to load your communities');
        throw error;
      }

      return data;
    }
  });

  const filteredCommunities = (() => {
    const communityList = activeTab === "trending" 
      ? communities 
      : activeTab === "joined" 
        ? joinedCommunities 
        : ownedCommunities;

    return communityList?.filter(community =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  })();

  const isLoading = activeTab === "trending" 
    ? isTrendingLoading 
    : activeTab === "joined" 
      ? isJoinedLoading 
      : isOwnedLoading;

  return (
    <div className="container max-w-6xl p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Communities</h1>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Community
        </Button>
      </div>

      <Tabs defaultValue="trending" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="owned">Your Communities</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search communities..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-32 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredCommunities?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No communities found</h3>
            <p className="text-muted-foreground">
              {activeTab === "trending" 
                ? "Try adjusting your search or create a new community"
                : activeTab === "joined"
                  ? "Join some communities to see them here"
                  : "Create a community to see it here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities?.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}
      </ScrollArea>

      <CreateCommunityDialog
        open={isCreating}
        onOpenChange={setIsCreating}
      />
    </div>
  );
};

export default Communities;