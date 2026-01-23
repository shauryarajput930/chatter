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
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOnlineStatusText, getOnlineStatusBgColor, formatLastSeen } from "@/utils/presenceUtils";

interface Profile {
  id: string;
  name: string;
  photo_url: string | null;
  is_online: boolean;
  last_seen?: string;
}

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableProfiles: Profile[];
  currentUserId: string;
  onCreateGroup: (groupName: string, memberIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  availableProfiles,
  currentUserId,
  onCreateGroup,
  isLoading = false,
}: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

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

  const filteredProfiles = useMemo(() => {
    return availableProfiles.filter(
      (p) =>
        p.id !== currentUserId &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableProfiles, searchQuery, currentUserId]);

  const toggleMember = (profileId: string) => {
    const updated = new Set(selectedMembers);
    if (updated.has(profileId)) {
      updated.delete(profileId);
    } else {
      updated.add(profileId);
    }
    setSelectedMembers(updated);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedMembers.size === 0) {
      alert("Please select at least one member");
      return;
    }

    try {
      await onCreateGroup(groupName, Array.from(selectedMembers));
      setGroupName("");
      setSelectedMembers(new Set());
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Group
          </DialogTitle>
          <DialogDescription>
            Create a group chat with your contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Group Name
            </label>
            <Input
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="rounded-xl"
              disabled={isLoading}
            />
          </div>

          {/* Search Members */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Add Members ({selectedMembers.size})
            </label>
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
          </div>

          {/* Members List */}
          <div className="border rounded-xl overflow-hidden">
            <ScrollArea className="h-64">
              <div className="divide-y">
                {filteredProfiles.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No contacts found
                  </div>
                ) : (
                  filteredProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => toggleMember(profile.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left",
                        selectedMembers.has(profile.id) && "bg-accent"
                      )}
                      disabled={isLoading}
                    >
                      <Checkbox
                        checked={selectedMembers.has(profile.id)}
                        onCheckedChange={() => toggleMember(profile.id)}
                        className="rounded"
                      />
                      <Avatar
                        name={profile.name}
                        imageUrl={profile.photo_url || undefined}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{profile.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Circle 
                            className={cn(
                              "w-2 h-2 fill-current",
                              profile.is_online ? "text-green-500" : "text-gray-400"
                            )}
                          />
                          <p className="text-xs text-muted-foreground">
                            {profile.is_online ? "Online" : formatLastSeen(profile.last_seen || "")}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={isLoading || !groupName.trim() || selectedMembers.size === 0}
              className="flex-1 rounded-xl"
            >
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
