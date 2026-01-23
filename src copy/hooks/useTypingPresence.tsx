import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingUser {
  name: string;
  photo?: string;
  profileId: string;
}

interface PresenceState {
  [key: string]: {
    profileId: string;
    name: string;
    photo?: string;
    isTyping: boolean;
  }[];
}

export function useTypingPresence(conversationId: string | undefined, currentProfile: { id: string; name: string; photo_url?: string | null } | null) {
  const [typingUser, setTypingUser] = useState<TypingUser | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up presence channel for the conversation
  useEffect(() => {
    if (!conversationId || !currentProfile) {
      setTypingUser(null);
      return;
    }

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: {
        presence: {
          key: currentProfile.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{
          profileId: string;
          name: string;
          photo?: string;
          isTyping: boolean;
        }>();

        // Find if someone else is typing
        const typingUsers = Object.entries(state as PresenceState)
          .flatMap(([, presences]) => presences)
          .filter((p) => p.profileId !== currentProfile.id && p.isTyping);

        if (typingUsers.length > 0) {
          const typer = typingUsers[0];
          setTypingUser({
            name: typer.name,
            photo: typer.photo,
            profileId: typer.profileId,
          });
        } else {
          setTypingUser(null);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            profileId: currentProfile.id,
            name: currentProfile.name,
            photo: currentProfile.photo_url || undefined,
            isTyping: false,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, currentProfile]);

  // Broadcast typing status
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !currentProfile) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      await channelRef.current.track({
        profileId: currentProfile.id,
        name: currentProfile.name,
        photo: currentProfile.photo_url || undefined,
        isTyping,
      });

      // Auto-stop typing after 3 seconds of no input
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          if (channelRef.current && currentProfile) {
            await channelRef.current.track({
              profileId: currentProfile.id,
              name: currentProfile.name,
              photo: currentProfile.photo_url || undefined,
              isTyping: false,
            });
          }
        }, 3000);
      }
    },
    [currentProfile]
  );

  // Stop typing (called when message is sent)
  const stopTyping = useCallback(async () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (channelRef.current && currentProfile) {
      await channelRef.current.track({
        profileId: currentProfile.id,
        name: currentProfile.name,
        photo: currentProfile.photo_url || undefined,
        isTyping: false,
      });
    }
  }, [currentProfile]);

  return {
    typingUser,
    setTyping,
    stopTyping,
  };
}
