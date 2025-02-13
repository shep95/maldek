
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Replace this with your actual public key that you generated
const VAPID_PUBLIC_KEY = 'YOUR_GENERATED_PUBLIC_KEY'; 

export const usePushNotifications = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check if push notifications are supported
  const isPushSupported = () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  };

  // Get service worker registration
  const getServiceWorkerRegistration = async () => {
    try {
      return await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Service Worker registration error:', error);
      return null;
    }
  };

  // Store subscription in Supabase
  const saveSubscription = async (subscription: PushSubscription) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode.apply(null, 
          new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode.apply(null, 
          new Uint8Array(subscription.getKey('auth')!))),
        user_agent: navigator.userAgent,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  };

  // Subscribe to push notifications
  const subscribeToNotifications = async () => {
    try {
      const registration = await getServiceWorkerRegistration();
      if (!registration) throw new Error('Service Worker not registered');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });

      await saveSubscription(subscription);
      setSubscription(subscription);
      setIsSubscribed(true);
      toast.success('Successfully subscribed to notifications!');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('Failed to subscribe to notifications');
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromNotifications = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);
        }

        setSubscription(null);
        setIsSubscribed(false);
        toast.success('Successfully unsubscribed from notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast.error('Failed to unsubscribe from notifications');
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (settings: {
    daily_reminders?: boolean;
    follow_notifications?: boolean;
    featured_user_posts?: boolean;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('push_notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isPushSupported()) return;

      const registration = await getServiceWorkerRegistration();
      if (!registration) return;

      const subscription = await registration.pushManager.getSubscription();
      setSubscription(subscription);
      setIsSubscribed(!!subscription);
    };

    checkSubscription();
  }, []);

  return {
    isSupported: isPushSupported(),
    isSubscribed,
    subscribe: subscribeToNotifications,
    unsubscribe: unsubscribeFromNotifications,
    updateSettings: updateNotificationSettings,
  };
};
