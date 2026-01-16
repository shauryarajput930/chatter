import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useUnreadCount() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({});

  const fetchUnreadCount = async () => {
    if (!profile) return;

    // Get all conversations for the user
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`participant_one.eq.${profile.id},participant_two.eq.${profile.id}`);

    if (!conversations?.length) return;

    const conversationIds = conversations.map((c) => c.id);

    // Get unread messages count
    const { data: messages } = await supabase
      .from("direct_messages")
      .select("conversation_id")
      .in("conversation_id", conversationIds)
      .neq("sender_id", profile.id)
      .eq("is_read", false);

    if (messages) {
      const total = messages.length;
      const byConversation: Record<string, number> = {};

      messages.forEach((msg) => {
        byConversation[msg.conversation_id] = (byConversation[msg.conversation_id] || 0) + 1;
      });

      setUnreadCount(total);
      setUnreadByConversation(byConversation);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return { unreadCount, unreadByConversation, refresh: fetchUnreadCount };
}
