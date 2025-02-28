
import { Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import TermsOfService from "@/pages/TermsOfService";
import Dashboard from "@/pages/Dashboard";
import Profiles from "@/pages/Profiles";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import Videos from "@/pages/Videos";
import PostDetail from "@/pages/PostDetail";
import VideoDetail from "@/pages/VideoDetail";

export const AppRoutes = () => {
  const session = useSession();
  const isLoggedIn = !!session;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? <Dashboard /> : <Navigate to="/auth" />
        }
      />
      <Route
        path="/@:username"
        element={
          isLoggedIn ? <Profiles /> : <Navigate to="/auth" />
        }
      />
      <Route
        path="/settings"
        element={
          isLoggedIn ? <Settings /> : <Navigate to="/auth" />
        }
      />
      <Route
        path="/subscription"
        element={
          isLoggedIn ? <Subscription /> : <Navigate to="/auth" />
        }
      />
      <Route
        path="/videos"
        element={
          isLoggedIn ? <Videos /> : <Navigate to="/auth" />
        }
      />
      <Route
        path="/post/:postId"
        element={
          isLoggedIn ? <PostDetail /> : <Navigate to="/auth" />
        }
      />

      {/* New Video Detail route */}
      <Route path="/video/:videoId" element={
        isLoggedIn ? <VideoDetail /> : <Navigate to="/auth" />
      } />

      {/* Redirects */}
      <Route path="/home" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};
