import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Videos from "@/pages/Videos";
import Profile from "@/pages/Profile";
import PostDetail from "@/pages/PostDetail";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Analytics from "@/pages/Analytics";
import Subscription from "@/pages/Subscription";
import Settings from "@/pages/Settings";
import DaarpAI from "@/pages/DaarpAI";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/@:username" element={<Profile />} />
        <Route path="/:username" element={<Profile />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/daarp-ai" element={<DaarpAI />} />
      </Route>
    </Routes>
  );
};