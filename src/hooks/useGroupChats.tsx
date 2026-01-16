import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface GroupChat {
  id: string;
  name: string;
  photo_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  memberCount: number;
  lastMessage?: {
    content: string;
    created_at: string;
    sender_name: string;
  };
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  reply_to_id: string | null;
  is_deleted: boolean;
  created_at: string;
  sender?: {
    name: string;
    photo_url: string | null;
  };
  reply_to?: {
    content: string;
    sender_name: string;
  };
}

interface GroupMember {
  id: string;
  profile_id: string;
  role: string;
  joined_at: string;
  profile?: {
    name: string;
    photo_url: string | null;
    is_online: boolean;
  };
}

export function useGroupChats() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    if (!profile) return;

    const { data: memberData } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("profile_id", profile.id);

    if (!memberData?.length) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = memberData.map((m) => m.group_id);

    const { data: groupsData } = await supabase
      .from("group_chats")
      .select("*")
      .in("id", groupIds)
      .order("updated_at", { ascending: false });

    if (groupsData) {
      const enrichedGroups = await Promise.all(
        groupsData.map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          const { data: lastMsg } = await supabase
            .from("group_messages")
            .select("content, created_at, sender_id")
            .eq("group_id", group.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          let lastMessage;
          if (lastMsg) {
            const { data: sender } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", lastMsg.sender_id)
              .single();

            lastMessage = {
              content: lastMsg.content,
              created_at: lastMsg.created_at,
              sender_name: sender?.name || "Unknown",
            };
          }

          return {
            ...group,
            memberCount: count || 0,
            lastMessage,
          };
        })
      );

      setGroups(enrichedGroups);
    }
    setLoading(false);
  };

  const fetchMessages = async (groupId: string) => {
    const { data } = await supabase
      .from("group_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (data) {
      const enrichedMessages = await Promise.all(
        data.map(async (msg) => {
          const { data: sender } = await supabase
            .from("profiles")
            .select("name, photo_url")
            .eq("id", msg.sender_id)
            .single();

          let reply_to;
          if (msg.reply_to_id) {
            const { data: replyMsg } = await supabase
              .from("group_messages")
              .select("content, sender_id")
              .eq("id", msg.reply_to_id)
              .single();

            if (replyMsg) {
              const { data: replySender } = await supabase
                .from("profiles")
                .select("name")
                .eq("id", replyMsg.sender_id)
                .single();

              reply_to = {
                content: replyMsg.content,
                sender_name: replySender?.name || "Unknown",
              };
            }
          }

          return {
            ...msg,
            sender,
            reply_to,
          };
        })
      );

      setMessages(enrichedMessages);
    }
  };

  const fetchMembers = async (groupId: string) => {
    const { data } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId);

    if (data) {
      const enrichedMembers = await Promise.all(
        data.map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, photo_url, is_online")
            .eq("id", member.profile_id)
            .single();

          return { ...member, profile };
        })
      );

      setMembers(enrichedMembers);
    }
  };

  const createGroup = async (name: string, memberIds: string[]) => {
    if (!profile) return null;

    const { data: group, error } = await supabase
      .from("group_chats")
      .insert({ name, created_by: profile.id })
      .select()
      .single();

    if (error || !group) return null;

    // Add creator as admin
    await supabase.from("group_members").insert({
      group_id: group.id,
      profile_id: profile.id,
      role: "admin",
    });

    // Add other members
    if (memberIds.length > 0) {
      await supabase.from("group_members").insert(
        memberIds.map((id) => ({
          group_id: group.id,
          profile_id: id,
          role: "member",
        }))
      );
    }

    await fetchGroups();
    return group;
  };

  const sendMessage = async (
    content: string,
    file?: { url: string; name: string; type: string },
    replyToId?: string
  ) => {
    if (!profile || !activeGroup) return;

    await supabase.from("group_messages").insert({
      group_id: activeGroup,
      sender_id: profile.id,
      content,
      file_url: file?.url,
      file_name: file?.name,
      file_type: file?.type,
      reply_to_id: replyToId,
    });

    await supabase
      .from("group_chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeGroup);
  };

  const deleteMessage = async (messageId: string) => {
    await supabase
      .from("group_messages")
      .update({ is_deleted: true })
      .eq("id", messageId);
  };

  useEffect(() => {
    fetchGroups();
  }, [profile]);

  useEffect(() => {
    if (activeGroup) {
      fetchMessages(activeGroup);
      fetchMembers(activeGroup);

      const channel = supabase
        .channel(`group-${activeGroup}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "group_messages",
            filter: `group_id=eq.${activeGroup}`,
          },
          () => fetchMessages(activeGroup)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeGroup]);

  return {
    groups,
    activeGroup,
    setActiveGroup,
    messages,
    members,
    loading,
    createGroup,
    sendMessage,
    deleteMessage,
    refreshGroups: fetchGroups,
  };
}
