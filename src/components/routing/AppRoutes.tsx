
// If this file already exists, we'll update it to ensure the Spaces route is properly defined
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import DaarpAI from "@/pages/DaarpAI";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profiles";
import PostDetail from "@/pages/PostDetail";
import HashtagPage from "@/pages/HashtagPage";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import Videos from "@/pages/Videos";
import Messages from "@/pages/Messages";
import Spaces from "@/pages/Spaces";
import Analytics from "@/pages/Analytics";
import Support from "@/pages/Support";
import BosleyCoin from "@/pages/BosleyCoin";
import EmperorChat from "@/pages/EmperorChat";
import Followers from "@/pages/Followers";
import Privacy from "@/pages/Privacy";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profiles" element={<Profile />} />
      <Route path="/profiles/:username" element={<Profile />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      <Route path="/hashtag/:hashtag" element={<HashtagPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/spaces" element={<Spaces />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/support" element={<Support />} />
      <Route path="/bosley-coin" element={<BosleyCoin />} />
      <Route path="/emperor-chat" element={<EmperorChat />} />
      <Route path="/followers" element={<Followers />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/daarp-ai" element={<DaarpAI />} />
    </Routes>
  );
};
