import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type CallStatus = "idle" | "ringing" | "calling" | "connected" | "rejected" | "missed" | "ended";

interface CallState {
  status: CallStatus;
  duration: number;
  isOnline: boolean;
  error?: string;
}

interface RealTimeCallProps {
  calleeId: string;
  onCallEnd?: () => void;
}

export function useRealTimeCall({ calleeId, onCallEnd }: RealTimeCallProps) {
  const { profile } = useAuth();
  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    duration: 0,
    isOnline: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  // Initialize audio for ringing tone
  useEffect(() => {
    // Create ringing tone (using Web Audio API)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 450; // Ringing frequency
    oscillator.type = "sine";
    
    // Create audio element for more control
    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Check if user is online
  const checkUserOnline = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("last_seen, is_online")
        .eq("id", calleeId)
        .single();

      if (!error && data) {
        const isOnline = data.is_online || 
          (data.last_seen && new Date(data.last_seen) > new Date(Date.now() - 5 * 60 * 1000));
        
        setCallState(prev => ({ ...prev, isOnline }));
        return isOnline;
      }
    } catch (error) {
      console.error("Error checking user online status:", error);
    }
    return false;
  }, [calleeId]);

  // Play ringing tone
  const playRingingTone = useCallback(() => {
    if (audioRef.current) {
      // Create a simple ringing tone using data URL
      const ringingDataUrl = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" +
        "AkOUqzn77BdGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
      
      audioRef.current.src = ringingDataUrl;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  }, []);

  // Stop ringing tone
  const stopRingingTone = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Start call duration timer
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  }, []);

  // Stop call duration timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Setup real-time channel
  const setupRealtimeChannel = useCallback(() => {
    if (!profile) return;

    const channelName = `call-${profile.id}-${calleeId}`;
    const channel = supabase.channel(channelName);

    channel
      .on("broadcast", { event: "call_status" }, (payload) => {
        const { status, from } = payload.payload;
        
        if (from !== profile.id) {
          handleRemoteCallStatus(status);
        }
      })
      .on("broadcast", { event: "call_response" }, (payload) => {
        const { response, from } = payload.payload;
        
        if (from !== profile.id) {
          handleCallResponse(response);
        }
      })
      .subscribe();

    channelRef.current = channel;
  }, [profile, calleeId]);

  // Handle remote call status updates
  const handleRemoteCallStatus = useCallback((status: CallStatus) => {
    setCallState(prev => ({ ...prev, status }));
    
    switch (status) {
      case "connected":
        stopRingingTone();
        startTimer();
        break;
      case "rejected":
      case "missed":
      case "ended":
        stopRingingTone();
        stopTimer();
        break;
    }
  }, [stopRingingTone, startTimer]);

  // Handle call responses
  const handleCallResponse = useCallback((response: "accept" | "reject") => {
    if (response === "accept") {
      setCallState(prev => ({ ...prev, status: "connected" }));
      stopRingingTone();
      startTimer();
    } else if (response === "reject") {
      setCallState(prev => ({ ...prev, status: "rejected" }));
      stopRingingTone();
      stopTimer();
      setTimeout(() => {
        endCall();
      }, 2000);
    }
  }, [stopRingingTone, startTimer]);

  // Start call
  const startCall = useCallback(async () => {
    if (!profile) return;

    const isUserOnline = await checkUserOnline();
    
    if (!isUserOnline) {
      setCallState(prev => ({ 
        ...prev, 
        status: "calling", 
        isOnline: false 
      }));
      
      // Auto-end call after 5 seconds for offline users
      ringingTimeoutRef.current = setTimeout(() => {
        setCallState(prev => ({ ...prev, status: "missed" }));
        setTimeout(() => endCall(), 2000);
      }, 5000);
      
      return;
    }

    // User is online, start ringing
    setCallState(prev => ({ 
      ...prev, 
      status: "ringing", 
      isOnline: true 
    }));
    
    playRingingTone();
    setupRealtimeChannel();

    // Send call request
    const channelName = `call-${calleeId}-${profile.id}`;
    await supabase.channel(channelName).send({
      type: "broadcast",
      event: "call_request",
      payload: {
        from: profile.id,
        to: calleeId,
        status: "ringing"
      }
    });

    // Set timeout for missed call (30 seconds)
    ringingTimeoutRef.current = setTimeout(() => {
      setCallState(prev => ({ ...prev, status: "missed" }));
      stopRingingTone();
      setTimeout(() => endCall(), 2000);
    }, 30000);
  }, [profile, calleeId, checkUserOnline, playRingingTone, setupRealtimeChannel]);

  // Accept call
  const acceptCall = useCallback(() => {
    setCallState(prev => ({ ...prev, status: "connected" }));
    stopRingingTone();
    startTimer();
    
    // Send acceptance
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "call_response",
        payload: {
          response: "accept",
          from: profile?.id
        }
      });
    }
  }, [stopRingingTone, startTimer, profile]);

  // Reject call
  const rejectCall = useCallback(() => {
    setCallState(prev => ({ ...prev, status: "rejected" }));
    stopRingingTone();
    
    // Send rejection
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "call_response",
        payload: {
          response: "reject",
          from: profile?.id
        }
      });
    }
    
    setTimeout(() => endCall(), 2000);
  }, [stopRingingTone, profile]);

  // End call
  const endCall = useCallback(() => {
    stopRingingTone();
    stopTimer();
    
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }

    setCallState(prev => ({ ...prev, status: "ended" }));
    
    // Send end call signal
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "call_status",
        payload: {
          status: "ended",
          from: profile?.id
        }
      });
      
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    onCallEnd?.();
  }, [stopRingingTone, stopTimer, profile, onCallEnd]);

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRingingTone();
      stopTimer();
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [stopRingingTone, stopTimer]);

  return {
    callState,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    formatDuration,
  };
}
