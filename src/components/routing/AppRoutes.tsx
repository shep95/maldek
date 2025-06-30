
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

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
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
      
      <Route path="/@:username" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Profiles />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/followers" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Followers />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Notifications />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/videos" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Videos />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profiles" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Profiles />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/features" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Features />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/post/:postId" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PostDetail />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/hashtag/:hashtag" element={
        <ProtectedRoute>
          <DashboardLayout>
            <HashtagPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/daarp-ai" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DaarpAI />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/messages" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Messages />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/subscription" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Subscription />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/bosley-coin" element={
        <ProtectedRoute>
          <DashboardLayout>
            <BosleyCoin />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/support" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Support />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/spaces" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Spaces />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/privacy" element={<Navigate to="/profiles?tab=privacy" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
