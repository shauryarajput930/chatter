import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { UserList } from "./UserList";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  photo_url: string | null;
  is_online: boolean;
  last_seen: string;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  onSelectUser: (profileId: string) => void;
}

export function NewChatDialog({
  open,
  onOpenChange,
  profiles,
  onSelectUser,
}: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (profileId: string) => {
    onSelectUser(profileId);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 shadow-neumorphic-inset",
                "focus:ring-2 focus:ring-primary/20"
              )}
            />
          </div>

          {/* User List */}
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            <UserList
              profiles={filteredProfiles}
              onSelectUser={handleSelectUser}
              title={searchQuery ? "Search results" : "All users"}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
