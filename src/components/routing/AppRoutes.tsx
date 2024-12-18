import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
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
import { PremiumFeatureNotice } from "@/components/ai/components/PremiumFeatureNotice";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

const ProtectedAnalytics = () => {
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
    return <PremiumFeatureNotice />;
  }

  // Dynamically import Analytics to avoid circular dependencies
  const Analytics = lazy(() => import('@/pages/Analytics'));
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Analytics />
    </Suspense>
  );
};

export const AppRoutes = () => {
  console.log("AppRoutes rendered");
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/@:username" element={<Profiles />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<ProtectedAnalytics />} />
        <Route path="/daarp-ai" element={<DaarpAI />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};