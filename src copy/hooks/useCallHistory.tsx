import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  id: string;
  name: string;
  photo_url: string | null;
}

export interface CallHistoryItem {
  id: string;
  caller_id: string;
  callee_id: string;
  room_name: string;
  status: string;
  call_type: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  caller?: Profile;
  callee?: Profile;
  direction: "incoming" | "outgoing";
  duration: number | null; // in seconds
}

export function useCallHistory() {
  const { profile } = useAuth();
  const [calls, setCalls] = useState<CallHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    const fetchCalls = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch calls where user is caller or callee
        const { data: callsData, error: callsError } = await supabase
          .from("video_calls")
          .select("*")
          .or(`caller_id.eq.${profile.id},callee_id.eq.${profile.id}`)
          .order("created_at", { ascending: false });

        if (callsError) throw callsError;

        if (!callsData || callsData.length === 0) {
          setCalls([]);
          setLoading(false);
          return;
        }

        // Get unique profile IDs
        const profileIds = new Set<string>();
        callsData.forEach((call) => {
          profileIds.add(call.caller_id);
          profileIds.add(call.callee_id);
        });

        // Fetch all related profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, photo_url")
          .in("id", Array.from(profileIds));

        if (profilesError) throw profilesError;

        const profilesMap = new Map<string, Profile>();
        profilesData?.forEach((p) => profilesMap.set(p.id, p));

        // Combine calls with profiles and calculate duration
        const enrichedCalls: CallHistoryItem[] = callsData.map((call) => {
          let duration: number | null = null;
          if (call.started_at && call.ended_at) {
            duration = Math.round(
              (new Date(call.ended_at).getTime() - new Date(call.started_at).getTime()) / 1000
            );
          }

          return {
            ...call,
            caller: profilesMap.get(call.caller_id),
            callee: profilesMap.get(call.callee_id),
            direction: call.caller_id === profile.id ? "outgoing" : "incoming",
            duration,
          };
        });

        setCalls(enrichedCalls);
      } catch (err) {
        console.error("Error fetching call history:", err);
        setError("Failed to load call history");
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [profile?.id]);

  const getFilteredCalls = (filter: "all" | "missed" | "incoming" | "outgoing") => {
    switch (filter) {
      case "missed":
        return calls.filter(
          (call) =>
            call.direction === "incoming" &&
            (call.status === "declined" || call.status === "missed" || call.status === "ringing")
        );
      case "incoming":
        return calls.filter((call) => call.direction === "incoming");
      case "outgoing":
        return calls.filter((call) => call.direction === "outgoing");
      default:
        return calls;
    }
  };

  return {
    calls,
    loading,
    error,
    getFilteredCalls,
  };
}
