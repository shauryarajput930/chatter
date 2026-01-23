import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
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

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  currentProfileId?: string;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  currentProfileId,
  onSelectConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-sm text-muted-foreground">No conversations yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start a chat with someone!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        const otherUser = conversation.other_participant;
        const lastMessage = conversation.last_message;
        const isUnread = lastMessage && !lastMessage.is_read && lastMessage.sender_id !== currentProfileId;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200",
              "relative overflow-hidden",
              isActive
                ? "bg-gradient-to-r from-primary/15 to-primary/5 shadow-lg border border-primary/20"
                : "hover:bg-accent/50 active:scale-[0.98] hover:shadow-md",
              "text-left group"
            )}
          >
            {/* Avatar with enhanced styling */}
            <div className="relative">
              <Avatar
                name={otherUser?.name || "Unknown"}
                imageUrl={otherUser?.photo_url || undefined}
                size="lg"
                online={otherUser?.is_online}
                showStatus
              />
              {isUnread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Name and Time */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-semibold text-sm truncate transition-colors",
                    isUnread ? "text-foreground" : "text-foreground",
                    isActive && "text-primary"
                  )}>
                    {otherUser?.name || "Unknown User"}
                  </p>
                  {otherUser?.username && (
                    <span className="text-xs text-muted-foreground font-medium">
                      @{otherUser.username}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <span className={cn(
                    "text-xs shrink-0 transition-colors",
                    isUnread ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: false })}
                  </span>
                )}
              </div>
              
              {/* Last Message */}
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm truncate flex-1 transition-colors",
                  isUnread ? "text-foreground font-medium" : "text-muted-foreground",
                  "group-hover:text-foreground"
                )}>
                  {lastMessage?.is_deleted
                    ? "🗑️ Message deleted"
                    : lastMessage?.content || "📝 No messages yet"}
                </p>
                {isUnread && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                )}
              </div>
            </div>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
