import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface MessageReaction {
  id: string;
  message_id: string;
  profile_id: string;
  emoji: string;
}

export function useMessageReactions(messageIds: string[]) {
  const { profile } = useAuth();
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});

  const fetchReactions = useCallback(async () => {
    if (!messageIds.length || !profile) return;

    const { data } = await supabase
      .from("message_reactions")
      .select("*")
      .in("message_id", messageIds);

    if (data) {
      const grouped: Record<string, Reaction[]> = {};

      messageIds.forEach((msgId) => {
        const msgReactions = data.filter((r) => r.message_id === msgId);
        const emojiMap: Record<string, { count: number; hasReacted: boolean }> = {};

        msgReactions.forEach((r) => {
          if (!emojiMap[r.emoji]) {
            emojiMap[r.emoji] = { count: 0, hasReacted: false };
          }
          emojiMap[r.emoji].count++;
          if (r.profile_id === profile.id) {
            emojiMap[r.emoji].hasReacted = true;
          }
        });

        grouped[msgId] = Object.entries(emojiMap).map(([emoji, data]) => ({
          emoji,
          ...data,
        }));
      });

      setReactions(grouped);
    }
  }, [messageIds, profile]);

  const addReaction = async (messageId: string, emoji: string) => {
    if (!profile) return;

    await supabase.from("message_reactions").upsert(
      {
        message_id: messageId,
        profile_id: profile.id,
        emoji,
      },
      { onConflict: "message_id,profile_id,emoji" }
    );

    fetchReactions();
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!profile) return;

    await supabase
      .from("message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("profile_id", profile.id)
      .eq("emoji", emoji);

    fetchReactions();
  };

  useEffect(() => {
    fetchReactions();

    const channel = supabase
      .channel("reactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        () => fetchReactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReactions]);

  return { reactions, addReaction, removeReaction };
}
