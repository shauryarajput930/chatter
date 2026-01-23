import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NotificationManager {
  showNotification: (
    title: string,
    options?: NotificationOptions
  ) => Promise<void>;
}

/**
 * Hook for managing and sending push notifications
 */
export function useNotificationManager(): NotificationManager {
  const { profile } = useAuth();

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!('Notification' in window)) {
        console.log('Notifications not supported');
        return;
      }

      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      try {
        // Get the service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Show notification
        await registration.showNotification(title, {
          icon: '/favicon.png',
          badge: '/favicon.png',
          tag: 'message-notification',
          ...options,
        });
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    },
    []
  );

  return {
    showNotification,
  };
}

/**
 * Component to listen for new messages and show notifications
 */
export function MessageNotificationListener() {
  const { profile } = useAuth();
  const { showNotification } = useNotificationManager();

  useEffect(() => {
    if (!profile || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Subscribe to new direct messages
    const dmChannel = supabase
      .channel(`dm-notifications:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=in.(SELECT id FROM conversations WHERE participant_one = '${profile.id}' OR participant_two = '${profile.id}')`,
        },
        async (payload) => {
          const message = payload.new;

          // Don't show notification if message is from current user
          if (message.sender_id === profile.id) {
            return;
          }

          // Get sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('name, photo_url')
            .eq('id', message.sender_id)
            .single();

          if (sender) {
            await showNotification(`New message from ${sender.name}`, {
              body: message.content.substring(0, 100),
              tag: `dm-${message.conversation_id}`,
              data: {
                url: `/messages?conversation=${message.conversation_id}`,
                type: 'direct_message',
              },
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new group messages
    const gmChannel = supabase
      .channel(`gm-notifications:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=in.(SELECT group_id FROM group_members WHERE profile_id = '${profile.id}')`,
        },
        async (payload) => {
          const message = payload.new;

          // Don't show notification if message is from current user
          if (message.sender_id === profile.id) {
            return;
          }

          // Get group and sender info
          const { data: group } = await supabase
            .from('group_chats')
            .select('name')
            .eq('id', message.group_id)
            .single();

          const { data: sender } = await supabase
            .from('profiles')
            .select('name, photo_url')
            .eq('id', message.sender_id)
            .single();

          if (group && sender) {
            await showNotification(`${sender.name} in ${group.name}`, {
              body: message.content.substring(0, 100),
              tag: `gm-${message.group_id}`,
              data: {
                url: `/chat?group=${message.group_id}`,
                type: 'group_message',
              },
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(dmChannel);
      supabase.removeChannel(gmChannel);
    };
  }, [profile, showNotification]);

  // This component doesn't render anything
  return null;
}
