import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Onboarding from "@/pages/Onboarding";
import Videos from "@/pages/Videos";
import Profile from "@/pages/Profile";
import PostDetail from "@/pages/PostDetail";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/auth"
        element={<Auth />}
      />
      <Route
        path="/onboarding"
        element={<Onboarding />}
      />
      <Route
        element={<DashboardLayout />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post/:postId" element={<PostDetail />} />
      </Route>
    </Routes>
  );
};