import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Videos from "@/pages/Videos";
import PostDetail from "@/pages/PostDetail";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Settings from "@/pages/Settings";
import DaarpAI from "@/pages/DaarpAI";
import Profiles from "@/pages/Profiles";
import Spaces from "@/pages/Spaces";
import Analytics from "@/pages/Analytics";
import Subscription from "@/pages/Subscription";

const ProtectedPremiumRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, tier:subscription_tiers(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  if (!subscription) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  const session = useSession();
  
  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      {/* Base routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard layout wrapper */}
      <Route element={<DashboardLayout />}>
        {/* Profile route MUST come before other routes to take precedence */}
        <Route path="/@:username" element={<Profiles />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route 
          path="/daarp-ai" 
          element={
            <ProtectedPremiumRoute>
              <DaarpAI />
            </ProtectedPremiumRoute>
          } 
        />
        <Route path="/subscription" element={<Subscription />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};