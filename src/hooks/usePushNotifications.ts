
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Replace with your generated public key
const VAPID_PUBLIC_KEY = 'BNjG3OqwMX4g6x6nZVy2B2RYHQxZ2MDp6y7CNkZR_HVfZ1B2JBJ4HxWT7qqQgr1TPOU9Oj4rRZ3mGhS-iHECu5U';

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
      if (!isPushSupported()) {
        console.log('Push notifications not supported');
        return;
      }

      const registration = await getServiceWorkerRegistration();
      if (!registration) throw new Error('Service Worker not registered');

      // Check if we already have permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

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

  // Check subscription status and auto-subscribe on mount
  useEffect(() => {
    const autoSubscribe = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (!isPushSupported()) return;

        const registration = await getServiceWorkerRegistration();
        if (!registration) return;

        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsSubscribed(true);
        } else {
          // Auto-subscribe if not already subscribed
          await subscribeToNotifications();
        }
      } catch (error) {
        console.error('Error in auto-subscribe:', error);
      }
    };

    autoSubscribe();
  }, []);

  return {
    isSupported: isPushSupported(),
    isSubscribed,
    subscribe: subscribeToNotifications,
    unsubscribe: unsubscribeFromNotifications,
    updateSettings: updateNotificationSettings,
  };
};
