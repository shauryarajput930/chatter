import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface VideoCall {
  id: string;
  caller_id: string;
  callee_id: string;
  room_name: string;
  call_type: "video" | "audio";
  status: "ringing" | "answered" | "ended" | "missed" | "declined";
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  caller?: {
    id: string;
    name: string;
    photo_url: string | null;
  };
  callee?: {
    id: string;
    name: string;
    photo_url: string | null;
  };
}

export function useVideoCalls() {
  const { profile } = useAuth();
  const [incomingCall, setIncomingCall] = useState<VideoCall | null>(null);
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  // Generate a unique room name
  const generateRoomName = useCallback(() => {
    return `call-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }, []);

  // Start a call
  const startCall = useCallback(
    async (calleeId: string, callType: "video" | "audio" = "video") => {
      if (!profile) return null;

      const roomName = generateRoomName();

      const { data, error } = await supabase
        .from("video_calls")
        .insert({
          caller_id: profile.id,
          callee_id: calleeId,
          room_name: roomName,
          call_type: callType,
          status: "ringing",
        })
        .select(`
          *,
          caller:profiles!video_calls_caller_id_fkey(id, name, photo_url),
          callee:profiles!video_calls_callee_id_fkey(id, name, photo_url)
        `)
        .single();

      if (error) {
        console.error("Failed to start call:", error);
        return null;
      }

      setActiveCall(data as VideoCall);
      setIsInCall(true);
      
      // Auto-answer for demo purposes (in real app, wait for callee to answer)
      setTimeout(() => {
        answerCall();
      }, 2000);
      
      return data as VideoCall;
    },
    [profile, generateRoomName]
  );

  // Answer a call
  const answerCall = useCallback(async () => {
    if (!incomingCall) return;

    const { error } = await supabase
      .from("video_calls")
      .update({
        status: "answered",
        started_at: new Date().toISOString(),
      })
      .eq("id", incomingCall.id);

    if (!error) {
      setActiveCall(incomingCall);
      setIsInCall(true);
      setIncomingCall(null);
    }
  }, [incomingCall]);

  // Decline a call
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;

    await supabase
      .from("video_calls")
      .update({ status: "declined", ended_at: new Date().toISOString() })
      .eq("id", incomingCall.id);

    setIncomingCall(null);
  }, [incomingCall]);

  // End a call
  const endCall = useCallback(async () => {
    if (!activeCall) return;

    await supabase
      .from("video_calls")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", activeCall.id);

    setActiveCall(null);
    setIsInCall(false);
  }, [activeCall]);

  // Listen for incoming calls
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel("video-calls")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "video_calls",
          filter: `callee_id=eq.${profile.id}`,
        },
        async (payload) => {
          // Fetch the full call details with caller info
          const { data } = await supabase
            .from("video_calls")
            .select(`
              *,
              caller:profiles!video_calls_caller_id_fkey(id, name, photo_url),
              callee:profiles!video_calls_callee_id_fkey(id, name, photo_url)
            `)
            .eq("id", payload.new.id)
            .single();

          if (data && data.status === "ringing") {
            setIncomingCall(data as VideoCall);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "video_calls",
        },
        (payload) => {
          const updated = payload.new as any;

          // If the call was ended/declined
          if (["ended", "declined", "missed"].includes(updated.status)) {
            if (incomingCall?.id === updated.id) {
              setIncomingCall(null);
            }
            if (activeCall?.id === updated.id) {
              setActiveCall(null);
              setIsInCall(false);
            }
          }

          // If call was answered
          if (updated.status === "answered" && activeCall?.id === updated.id) {
            setActiveCall((prev) => (prev ? { ...prev, ...updated } : null));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, incomingCall, activeCall]);

  return {
    incomingCall,
    activeCall,
    isInCall,
    startCall,
    answerCall,
    declineCall,
    endCall,
  };
}
