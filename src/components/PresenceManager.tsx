import { useEffect } from "react";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";

/**
 * PresenceManager Component
 * 
 * This component handles real-time online/offline status tracking.
 * It should be placed inside the AuthProvider to track user presence.
 */
export function PresenceManager() {
  const { setPresence } = useRealtimePresence();

  useEffect(() => {
    // Set user as online when component mounts
    setPresence(true);

    return () => {
      // Cleanup will be handled by the hook itself
    };
  }, [setPresence]);

  // This component doesn't render anything
  return null;
}
