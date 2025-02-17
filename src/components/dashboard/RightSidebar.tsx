
import { LiveSubscriptionCounts } from "@/components/subscription/LiveSubscriptionCounts";
import { TrendingPosts } from "./sidebar/TrendingPosts";
import { TrendingUsers } from "./sidebar/TrendingUsers";

export const RightSidebar = () => {
  return (
    <aside className="hidden lg:flex lg:flex-col w-80 border-l border-border min-h-screen fixed top-0 right-0 pt-20 pb-8 px-4 space-y-6 overflow-y-auto max-h-screen">
      <LiveSubscriptionCounts />
      <TrendingPosts />
      <TrendingUsers />
    </aside>
  );
};
