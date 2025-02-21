
import { Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profiles from "@/pages/Profiles";
import PostDetail from "@/pages/PostDetail";
import DaarpAI from "@/pages/DaarpAI";
import Subscription from "@/pages/Subscription";
import Advertisement from "@/pages/Advertisement";
import Settings from "@/pages/Settings";
import EmperorChat from "@/pages/EmperorChat";
import Analytics from "@/pages/Analytics";
import Spaces from "@/pages/Spaces";
import Videos from "@/pages/Videos";
import Notifications from "@/pages/Notifications";
import Followers from "@/pages/Followers";
import PlayConsole from "@/pages/PlayConsole";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profiles/:username" element={<Profiles />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/ai" element={<DaarpAI />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/advertisement" element={<Advertisement />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/emperor-chat" element={<EmperorChat />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/spaces" element={<Spaces />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/followers" element={<Followers />} />
      <Route path="/play-console" element={<PlayConsole />} />
    </Routes>
  );
};
