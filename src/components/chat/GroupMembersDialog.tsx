import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "./Avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Trash2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLastSeen } from "@/utils/presenceUtils";

interface GroupMember {
  id: string;
  profile_id: string;
  role: string;
  joined_at: string;
  profile?: {
    name: string;
    photo_url: string | null;
    is_online: boolean;
    last_seen?: string;
  };
}

interface GroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  members: GroupMember[];
  currentUserId: string;
  isGroupAdmin?: boolean;
  onRemoveMember?: (profileId: string) => Promise<void>;
  isLoading?: boolean;
}

export function GroupMembersDialog({
  open,
  onOpenChange,
  groupName,
  members,
  currentUserId,
  isGroupAdmin = false,
  onRemoveMember,
  isLoading = false,
}: GroupMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Listen for real-time presence updates
  useEffect(() => {
    const handlePresenceUpdate = (event: CustomEvent) => {
      const { user_id, is_online, last_seen } = event.detail;
      // Force re-render by updating a dummy state
      setSearchQuery(prev => prev);
    };

    window.addEventListener('presence_update', handlePresenceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('presence_update', handlePresenceUpdate as EventListener);
    };
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.profile?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleRemoveMember = async (profileId: string) => {
    if (confirm("Remove this member from the group?")) {
      try {
        await onRemoveMember?.(profileId);
      } catch (error) {
        console.error("Failed to remove member:", error);
        alert("Failed to remove member");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {groupName}
          </DialogTitle>
          <DialogDescription>
            {members.length} member{members.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Members */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
              disabled={isLoading}
            />
          </div>

          {/* Members List */}
          <div className="border rounded-xl overflow-hidden">
            <ScrollArea className="h-96">
              <div className="divide-y">
                {filteredMembers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No members found
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center gap-3 p-3 hover:bg-accent transition-colors",
                        member.profile_id === currentUserId && "bg-accent/50"
                      )}
                    >
                      <Avatar
                        name={member.profile?.name || "Unknown"}
                        imageUrl={member.profile?.photo_url || undefined}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {member.profile?.name}
                          </p>
                          <Badge
                            variant={
                              member.role === "admin" ? "default" : "secondary"
                            }
                            className="text-xs rounded-full"
                          >
                            {member.role === "admin" ? "Admin" : "Member"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Circle 
                            className={cn(
                              "w-2 h-2 fill-current",
                              member.profile?.is_online ? "text-green-500" : "text-gray-400"
                            )}
                          />
                          <p className="text-xs text-muted-foreground">
                            {member.profile?.is_online 
                              ? "Online" 
                              : formatLastSeen(member.profile?.last_seen || "")
                            }
                          </p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      {isGroupAdmin &&
                        member.profile_id !== currentUserId &&
                        onRemoveMember && (
                          <button
                            onClick={() => handleRemoveMember(member.profile_id)}
                            disabled={isLoading}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors disabled:opacity-50"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl"
            variant="outline"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
