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
import { Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLastSeen } from "@/utils/presenceUtils";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string;
  photo_url: string | null;
  is_online: boolean;
  last_seen?: string;
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  currentMemberIds: string[];
  onAddMembers: (memberIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  groupId,
  currentMemberIds,
  onAddMembers,
  isLoading = false,
}: AddMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available profiles (not already in group)
  const fetchAvailableProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, photo_url, is_online, last_seen")
        .not("id", "in", `(${currentMemberIds.join(',')})`);

      if (data && !error) {
        setAvailableProfiles(data);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailableProfiles();
      setSelectedMembers(new Set());
      setSearchQuery("");
    }
  }, [open, currentMemberIds]);

  // Listen for real-time presence updates
  useEffect(() => {
    const handlePresenceUpdate = (event: CustomEvent) => {
      const { user_id, is_online, last_seen } = event.detail;
      setAvailableProfiles(prev => 
        prev.map(p => 
          p.id === user_id ? { ...p, is_online, last_seen } : p
        )
      );
    };

    window.addEventListener('presence_update', handlePresenceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('presence_update', handlePresenceUpdate as EventListener);
    };
  }, []);

  const filteredProfiles = useMemo(() => {
    return availableProfiles.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableProfiles, searchQuery]);

  const toggleMember = (profileId: string) => {
    const updated = new Set(selectedMembers);
    if (updated.has(profileId)) {
      updated.delete(profileId);
    } else {
      updated.add(profileId);
    }
    setSelectedMembers(updated);
  };

  const handleAddMembers = async () => {
    if (selectedMembers.size === 0) {
      alert("Please select at least one member");
      return;
    }

    try {
      await onAddMembers(Array.from(selectedMembers));
      setSelectedMembers(new Set());
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add members:", error);
      alert("Failed to add members");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Members to Group
          </DialogTitle>
          <DialogDescription>
            Select members to add to this group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Members */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Add Members ({selectedMembers.size} selected)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
                disabled={loading}
              />
            </div>
          </div>

          {/* Members List */}
          <div className="border rounded-xl overflow-hidden">
            <ScrollArea className="h-64">
              <div className="divide-y">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Loading members...
                  </div>
                ) : filteredProfiles.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {searchQuery ? "No members found" : "No more members to add"}
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
                          <div 
                            className={cn(
                              "w-2 h-2 rounded-full",
                              profile.is_online ? "bg-green-500" : "bg-gray-400"
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
              onClick={handleAddMembers}
              disabled={isLoading || selectedMembers.size === 0}
              className="flex-1 rounded-xl"
            >
              {isLoading ? "Adding..." : `Add ${selectedMembers.size} Member${selectedMembers.size !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
