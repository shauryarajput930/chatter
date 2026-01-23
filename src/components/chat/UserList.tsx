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

interface UserListProps {
  profiles: Profile[];
  onSelectUser: (profileId: string) => void;
  title?: string;
}

export function UserList({ profiles, onSelectUser, title = "Start a chat" }: UserListProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-sm text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground px-2 mb-3">
          {title}
        </h3>
      )}
      {profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => onSelectUser(profile.id)}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl",
            "transition-all duration-200",
            "hover:bg-accent/50 active:scale-[0.98]",
            "text-left"
          )}
        >
          <Avatar
            name={profile.name}
            imageUrl={profile.photo_url || undefined}
            size="md"
            online={profile.is_online}
            showStatus
          />
          <div className="flex-1 min-w-0">
            {profile.username ? (
              <>
                <p className="font-medium text-sm text-foreground truncate">
                  @{profile.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.name}
                </p>
              </>
            ) : (
              <p className="font-medium text-sm text-foreground truncate">
                {profile.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground truncate">
              {profile.is_online
                ? "Online"
                : `Last seen ${formatDistanceToNow(new Date(profile.last_seen), { addSuffix: true })}`}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
