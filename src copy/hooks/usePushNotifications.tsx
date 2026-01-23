import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey?: string;
}

export function usePushNotifications() {
  const { profile } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported on this device');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register service worker';
      setError(errorMessage);
      console.error('Service Worker registration failed:', err);
      return false;
    }
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported || !('Notification' in window)) {
      setError('Notifications are not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Register service worker after permission granted
        await registerServiceWorker();
        return true;
      } else {
        setError('Notification permission denied');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      console.error('Permission request failed:', err);
      return false;
    }
  }, [isSupported, registerServiceWorker]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (vapidKey?: string) => {
    if (!isSupported || !profile) {
      setError('Push notifications not supported or user not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return false;
        }
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        setIsLoading(false);
        return false;
      }

      // Get push manager
      const pushManager = registration.pushManager;

      // Check if already subscribed
      let subscription = await pushManager.getSubscription();

      if (subscription) {
        console.log('Already subscribed to push notifications');
        setIsSubscribed(true);
        setIsLoading(false);
        return true;
      }

      // Subscribe to push notifications
      const options: PushSubscriptionOptions = {
        userVisibleOnly: true,
      };

      if (vapidKey) {
        options.applicationServerKey = urlBase64ToUint8Array(vapidKey) as unknown as string;
      }

      subscription = await pushManager.subscribe(options);

      if (!subscription) {
        throw new Error('Failed to create push subscription');
      }

      // Save subscription to database
      const subscriptionJson = subscription.toJSON();

      const { error: dbError } = await supabase.from('push_subscriptions').insert({
        user_id: profile.user_id,
        profile_id: profile.id,
        endpoint: subscriptionJson.endpoint || '',
        p256dh: (subscriptionJson.keys?.p256dh as string) || '',
        auth: (subscriptionJson.keys?.auth as string) || '',
        platform: 'web',
      });

      if (dbError) {
        console.error('Failed to save subscription to database:', dbError);
        // Unsubscribe if database save fails
        await subscription.unsubscribe();
        setError('Failed to save subscription');
        setIsLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setIsLoading(false);
      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(errorMessage);
      console.error('Push subscription failed:', err);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, profile, requestPermission, registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported || !profile) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        console.log('Not subscribed to push notifications');
        setIsSubscribed(false);
        setIsLoading(false);
        return true;
      }

      // Unsubscribe from push manager
      const unsubscribed = await subscription.unsubscribe();

      if (!unsubscribed) {
        throw new Error('Failed to unsubscribe from push manager');
      }

      // Remove from database
      const endpoint = subscription.endpoint;

      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('profile_id', profile.id)
        .eq('endpoint', endpoint);

      if (dbError) {
        console.error('Failed to remove subscription from database:', dbError);
        setError('Failed to remove subscription');
        setIsLoading(false);
        return false;
      }

      setIsSubscribed(false);
      setIsLoading(false);
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(errorMessage);
      console.error('Unsubscribe failed:', err);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, profile]);

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    if (!isSupported) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Failed to check subscription:', err);
    }
  }, [isSupported]);

  // Check subscription on mount
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Keep service worker alive
  useEffect(() => {
    if (!isSupported) return;

    const interval = setInterval(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ type: 'KEEP_ALIVE' });
        }
      } catch (err) {
        console.error('Failed to keep service worker alive:', err);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
    checkSubscription,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
