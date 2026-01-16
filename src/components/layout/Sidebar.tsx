import { useState } from "react";
import { MessageCircle, Users, Settings, LogOut, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { GroupCard } from "@/components/chat/GroupCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
}

interface SidebarProps {
  rooms: Room[];
  activeRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  onNewGroup: () => void;
  currentUser?: {
    name: string;
    email: string;
    photo?: string;
  };
  onLogout?: () => void;
}

export function Sidebar({
  rooms,
  activeRoomId,
  onSelectRoom,
  onNewGroup,
  currentUser,
  onLogout,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 h-screen flex flex-col bg-card border-r border-border shadow-neumorphic">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-soft">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-xl text-foreground">Chatter</h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-xl bg-muted shadow-neumorphic-inset",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              "transition-all duration-200"
            )}
          />
        </div>
      </div>

      {/* Groups Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">My Groups</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewGroup}
          className="h-8 w-8 p-0 rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 custom-scrollbar">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No groups found</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewGroup}
              className="mt-2 text-primary"
            >
              Create your first group
            </Button>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <GroupCard
              key={room.id}
              name={room.name}
              memberCount={room.memberCount}
              createdAt={room.createdAt}
              isActive={room.id === activeRoomId}
              onClick={() => onSelectRoom(room.id)}
            />
          ))
        )}
      </div>

      {/* User Section */}
      {currentUser && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar
              name={currentUser.name}
              imageUrl={currentUser.photo}
              size="md"
              online
              showStatus
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.email}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
