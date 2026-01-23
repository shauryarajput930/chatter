import { LogOut, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/chat/Avatar";
import { GroupCard } from "@/components/chat/GroupCard";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

interface Profile {
  id: string;
  name: string;
  username?: string;
  photo_url: string | null;
}

interface GroupSidebarProps {
  groups: GroupChat[];
  activeGroupId: string | null;
  onSelectGroup: (group: GroupChat) => void;
  onNewGroup: () => void;
  currentProfile: Profile;
  onLogout: () => void;
}

export function GroupSidebar({
  groups,
  activeGroupId,
  onSelectGroup,
  onNewGroup,
  currentProfile,
  onLogout,
}: GroupSidebarProps) {
  return (
    <div className="w-80 h-screen flex flex-col bg-card shadow-neumorphic border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar
              name={currentProfile.name}
              imageUrl={currentProfile.photo_url || undefined}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {currentProfile.name}
              </p>
              {currentProfile.username && (
                <p className="text-xs text-muted-foreground truncate">
                  @{currentProfile.username}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Groups</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="rounded-lg"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Create Group Button */}
        <Button
          onClick={onNewGroup}
          className="w-full rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" />
          New Group
        </Button>
      </div>

      {/* Groups List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {/* Example Direct Messages */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground px-2 mb-2">DIRECT MESSAGES</p>
            <GroupCard
              name="Sarah Johnson"
              memberCount={1}
              createdAt="2 days ago"
              isActive={false}
              onClick={() => {}}
              isGroup={false} // This is a direct message
            />
            <GroupCard
              name="Mike Chen"
              memberCount={1}
              createdAt="1 week ago"
              isActive={false}
              onClick={() => {}}
              isGroup={false} // This is a direct message
            />
          </div>

          {/* Groups */}
          <div>
            <p className="text-xs font-medium text-muted-foreground px-2 mb-2">GROUPS</p>
            {groups.length === 0 ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  No Groups Yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Click "Create New Group" to get started
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.id} onClick={() => onSelectGroup(group)}>
                  <GroupCard
                    name={group.name}
                    memberCount={group.memberCount}
                    createdAt={formatDistanceToNow(new Date(group.created_at), {
                      addSuffix: true,
                    })}
                    isActive={activeGroupId === group.id}
                    onClick={() => onSelectGroup(group)}
                    isGroup={true} // This is a group
                  />
                  {group.lastMessage && (
                    <p className="text-xs text-muted-foreground px-2 mt-1 truncate">
                      {group.lastMessage.sender_name}:{" "}
                      {group.lastMessage.content.substring(0, 30)}...
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
