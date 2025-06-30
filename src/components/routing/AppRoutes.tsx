
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Followers from "@/pages/Followers";
import Notifications from "@/pages/Notifications";
import Videos from "@/pages/Videos";
import PostDetail from "@/pages/PostDetail";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Settings from "@/pages/Settings";
import DaarpAI from "@/pages/DaarpAI";
import Profiles from "@/pages/Profiles";
import Analytics from "@/pages/Analytics";
import TermsOfService from "@/pages/TermsOfService";
import Features from "@/pages/Features";
import HashtagPage from "@/pages/HashtagPage";
import Messages from "@/pages/Messages";
import Subscription from "@/pages/Subscription";
import BosleyCoin from "@/pages/BosleyCoin";
import Support from "@/pages/Support";
import Spaces from "@/pages/Spaces";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  
  if (!session) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes = () => {
  const session = useSession();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/terms" element={<TermsOfService />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/@:username" element={<Profiles />} />
        <Route path="/followers" element={<Followers />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/features" element={<Features />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/hashtag/:hashtag" element={<HashtagPage />} />
        <Route path="/daarp-ai" element={<DaarpAI />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/bosley-coin" element={<BosleyCoin />} />
        <Route path="/support" element={<Support />} />
        <Route path="/privacy" element={<Navigate to="/profiles?tab=privacy" replace />} />
        <Route path="/spaces" element={<Spaces />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
