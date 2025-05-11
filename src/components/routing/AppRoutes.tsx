import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Notifications from "@/pages/Notifications";
import Videos from "@/pages/Videos";
import Followers from "@/pages/Followers";
import Profiles from "@/pages/Profiles";
import Analytics from "@/pages/Analytics";
import DaarpAI from "@/pages/DaarpAI";
import Settings from "@/pages/Settings";
import PostDetail from "@/pages/PostDetail";
import EmperorChat from "@/pages/EmperorChat";
import Advertisement from "@/pages/Advertisement";
import Features from "@/pages/Features";
import Spaces from "@/pages/Spaces";
import HashtagPage from "@/pages/HashtagPage";
import TermsOfService from "@/pages/TermsOfService";
import Messages from "@/pages/Messages";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/followers" element={<Followers />} />
      <Route path="/profiles" element={<Profiles />} />
      <Route path="/user/:username" element={<Profiles />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/daarp-ai" element={<DaarpAI />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      <Route path="/emperor" element={<EmperorChat />} />
      <Route path="/advertisement" element={<Advertisement />} />
      <Route path="/features" element={<Features />} />
      <Route path="/spaces" element={<Spaces />} />
      <Route path="/hashtag/:tag" element={<HashtagPage />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/messages" element={<Messages />} />
    </Routes>
  );
};
