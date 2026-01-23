import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { UserList } from "./UserList";
import { cn } from "@/lib/utils";

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
    (profile) => {
      const query = searchQuery.toLowerCase();
      
      // Prioritize username search - if user types @username or just username
      if (query.startsWith('@')) {
        // Search by @username
        return profile.username?.toLowerCase().includes(query.substring(1));
      } else {
        // Search by username first, then name, then email
        return (
          profile.username?.toLowerCase().includes(query) ||
          profile.name.toLowerCase().includes(query) ||
          profile.email?.toLowerCase().includes(query)
        );
      }
    }
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
              placeholder="Search by username (e.g., @john_doe123)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 pr-10 shadow-neumorphic-inset",
                "focus:ring-2 focus:ring-primary/20"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User List - Only show when searching */}
          {searchQuery.trim() && (
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <UserList
                profiles={filteredProfiles}
                onSelectUser={handleSelectUser}
                title={filteredProfiles.length > 0 ? "Found users" : "No users found"}
              />
            </div>
          )}

          {/* Show helpful message when not searching */}
          {!searchQuery.trim() && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Type a username to find friends
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                e.g., @john_doe123 or john_doe
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
