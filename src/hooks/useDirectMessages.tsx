import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  username?: string;
  email: string | null;
  photo_url: string | null;
  is_online: boolean;
  last_seen: string;
}

interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  created_at: string;
  updated_at: string;
  other_participant?: Profile;
  last_message?: DirectMessage;
}

interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_deleted: boolean;
  is_delivered: boolean;
  created_at: string;
  sender?: Profile;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  reply_to_id?: string | null;
  reply_to?: {
    content: string;
    sender_name: string;
  };
  // Client-side only - for optimistic UI
  sending?: boolean;
}

export function useDirectMessages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all profiles for starting new conversations
  const fetchProfiles = useCallback(async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", profile.id);

    if (data && !error) {
      setAllProfiles(data);
    }
  }, [profile]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!profile) return;

    const { data: convData, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_one.eq.${profile.id},participant_two.eq.${profile.id}`)
      .order("updated_at", { ascending: false });

    if (error || !convData) {
      setLoading(false);
      return;
    }

    // Fetch other participants and last messages
    const conversationsWithDetails = await Promise.all(
      convData.map(async (conv) => {
        const otherParticipantId =
          conv.participant_one === profile.id
            ? conv.participant_two
            : conv.participant_one;

        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherParticipantId)
          .maybeSingle();

        const { data: lastMsg } = await supabase
          .from("direct_messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...conv,
          other_participant: otherProfile || undefined,
          last_message: lastMsg || undefined,
        };
      })
    );

    setConversations(conversationsWithDetails);
    setLoading(false);
  }, [profile]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async () => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("conversation_id", activeConversation.id)
      .order("created_at", { ascending: true });

    if (data && !error) {
      // Fetch sender profiles and reply info
      const messagesWithSenders = await Promise.all(
        data.map(async (msg) => {
          const { data: sender } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", msg.sender_id)
            .maybeSingle();

          let reply_to;
          if (msg.reply_to_id) {
            const { data: replyMsg } = await supabase
              .from("direct_messages")
              .select("content, sender_id")
              .eq("id", msg.reply_to_id)
              .maybeSingle();

            if (replyMsg) {
              const { data: replySender } = await supabase
                .from("profiles")
                .select("name")
                .eq("id", replyMsg.sender_id)
                .maybeSingle();

              reply_to = {
                content: replyMsg.content,
                sender_name: replySender?.name || "Unknown",
              };
            }
          }

          return {
            ...msg,
            sender: sender || undefined,
            reply_to,
          };
        })
      );
      setMessages(messagesWithSenders);

      // Mark messages as read
      const unreadIds = data
        .filter((m) => !m.is_read && m.sender_id !== profile?.id)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("direct_messages")
          .update({ is_read: true })
          .in("id", unreadIds);
      }
    }
  }, [activeConversation, profile]);

  // Start a new conversation or get existing one
  const startConversation = useCallback(
    async (otherProfileId: string): Promise<Conversation | null> => {
      if (!profile) return null;

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant_one.eq.${profile.id},participant_two.eq.${otherProfileId}),and(participant_one.eq.${otherProfileId},participant_two.eq.${profile.id})`
        )
        .maybeSingle();

      if (existing) {
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherProfileId)
          .maybeSingle();

        const conv = { ...existing, other_participant: otherProfile || undefined };
        setActiveConversation(conv);
        return conv;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          participant_one: profile.id,
          participant_two: otherProfileId,
        })
        .select()
        .single();

      if (error || !newConv) return null;

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherProfileId)
        .maybeSingle();

      const conv = { ...newConv, other_participant: otherProfile || undefined };
      setActiveConversation(conv);
      await fetchConversations();
      return conv;
    },
    [profile, fetchConversations]
  );

  // Send a message
  const sendMessage = useCallback(
    async (
      content: string,
      file?: { url: string; name: string; type: string },
      replyToId?: string
    ) => {
      if (!profile || !activeConversation) return;

      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: profile.id,
          content,
          file_url: file?.url || null,
          file_name: file?.name || null,
          file_type: file?.type || null,
          reply_to_id: replyToId || null,
        })
        .select()
        .single();

      if (data && !error) {
        // Update conversation's updated_at
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", activeConversation.id);

        await fetchConversations();
      }
    },
    [profile, activeConversation, fetchConversations]
  );

  // Delete a message (soft delete)
  const deleteMessage = useCallback(
    async (messageId: string) => {
      await supabase
        .from("direct_messages")
        .update({ is_deleted: true })
        .eq("id", messageId);
    },
    []
  );

  // Mark message as delivered
  const markAsDelivered = useCallback(
    async (messageId: string) => {
      await supabase
        .from("direct_messages")
        .update({ is_delivered: true })
        .eq("id", messageId);
    },
    []
  );

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("id", messageId);
    },
    []
  );

  // Mark all messages in conversation as read
  const markConversationAsRead = useCallback(
    async (conversationId: string) => {
      if (!profile) return;
      await supabase
        .from("direct_messages")
        .update({ is_read: true, is_delivered: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", profile.id);
    },
    [profile]
  );

  // Set up realtime subscriptions
  useEffect(() => {
    if (!profile) return;

    fetchProfiles();
    fetchConversations();
  }, [profile, fetchProfiles, fetchConversations]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`messages:${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, fetchMessages]);

  // Realtime subscription for profiles (online status)
  useEffect(() => {
    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchProfiles();
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProfiles, fetchConversations]);

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    allProfiles,
    loading,
    startConversation,
    sendMessage,
    deleteMessage,
    markAsDelivered,
    markAsRead,
    markConversationAsRead,
    refreshConversations: fetchConversations,
  };
}
