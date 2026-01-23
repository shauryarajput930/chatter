import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface PresenceState {
  isOnline: boolean;
  lastSeen: string;
}

export function useRealtimePresence() {
  const { user, profile } = useAuth();
  const channelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCleanupRef = useRef(false);

  // Update user's online status
  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user || isCleanupRef.current) return;

    try {
      await supabase
        .from("profiles")
        .update({ 
          is_online: isOnline, 
          last_seen: new Date().toISOString() 
        })
        .eq("user_id", user.id);

      // Broadcast presence change to all connected clients
      if (channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'presence_change',
          payload: {
            user_id: user.id,
            is_online: isOnline,
            last_seen: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user]);

  // Initialize presence tracking
  useEffect(() => {
    if (!user) return;

    isCleanupRef.current = false;

    const initializePresence = async () => {
      try {
        // Set user as online immediately
        await updatePresence(true);

        // Create presence channel for real-time updates
        const channel = supabase.channel('presence_updates');
        channelRef.current = channel;

        // Listen for presence changes from other users
        channel
          .on('broadcast', { event: 'presence_change' }, (payload: any) => {
            const { user_id, is_online, last_seen } = payload.payload;
            
            // Update local state if it's not the current user
            if (user_id !== user.id) {
              // This will trigger re-renders in components that subscribe to profile changes
              const event = new CustomEvent('presence_update', {
                detail: { user_id, is_online, last_seen }
              });
              window.dispatchEvent(event);
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Presence channel subscribed');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Presence channel error');
            }
          });

        // Start heartbeat to maintain online status
        heartbeatIntervalRef.current = setInterval(() => {
          updatePresence(true);
        }, 30000); // Every 30 seconds

      } catch (error) {
        console.error('Error initializing presence:', error);
      }
    };

    initializePresence();

    // Cleanup function
    return () => {
      isCleanupRef.current = true;
      
      // Clear heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      // Set user as offline
      updatePresence(false);

      // Unsubscribe from channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, updatePresence]);

  // Handle browser events
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      // When tab becomes hidden, set as offline
      if (document.hidden) {
        updatePresence(false);
      } else {
        // When tab becomes visible again, set as online
        updatePresence(true);
      }
    };

    const handleBeforeUnload = () => {
      // Set as offline when user is leaving
      updatePresence(false);
    };

    const handlePageHide = () => {
      // Handle mobile browser page hide
      updatePresence(false);
    };

    const handleFocus = () => {
      // When window gains focus, set as online
      updatePresence(true);
    };

    const handleBlur = () => {
      // When window loses focus, set as offline
      updatePresence(false);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Handle network connectivity
    const handleOnline = () => {
      updatePresence(true);
    };

    const handleOffline = () => {
      updatePresence(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, updatePresence]);

  // Function to manually update presence
  const setPresence = useCallback((isOnline: boolean) => {
    updatePresence(isOnline);
  }, [updatePresence]);

  return {
    setPresence,
    isOnline: profile?.is_online || false,
    lastSeen: profile?.last_seen || ''
  };
}
