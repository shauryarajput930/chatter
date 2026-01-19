import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function use2FAStatus() {
  const { user, session } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !session) {
      setIs2FAEnabled(false);
      setLoading(false);
      return;
    }

    const check2FAStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("totp-2fa/status", {
          method: "GET",
        });

        if (!error && data) {
          setIs2FAEnabled(data.enabled);
        }
      } catch (err) {
        console.error("Error checking 2FA status:", err);
      } finally {
        setLoading(false);
      }
    };

    check2FAStatus();
  }, [user, session]);

  return { is2FAEnabled, loading, refetch: () => {
    setLoading(true);
    // Re-trigger effect by forcing a state update
  }};
}
