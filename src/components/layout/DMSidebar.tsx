import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Plus, Search, Settings, LogOut, Users, Phone } from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { ConversationList } from "@/components/chat/ConversationList";
import { Button } from "@/components/ui/button";
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

interface DMSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  currentProfile?: Profile | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat: () => void;
  onLogout?: () => void;
}

export function DMSidebar({
  conversations,
  activeConversationId,
  currentProfile,
  onSelectConversation,
  onNewChat,
  onLogout,
}: DMSidebarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.other_participant?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search conversations..."
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

      {/* Messages Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Messages</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="h-8 w-8 p-0 rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
        <ConversationList
          conversations={filteredConversations}
          activeConversationId={activeConversationId}
          currentProfileId={currentProfile?.id}
          onSelectConversation={onSelectConversation}
        />
      </div>

      {/* User Section */}
      {currentProfile && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar
              name={currentProfile.name}
              imageUrl={currentProfile.photo_url || undefined}
              size="md"
              online
              showStatus
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {currentProfile.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentProfile.email}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/call-history')}
                className="h-8 w-8 rounded-lg"
                title="Call History"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/settings')}
                className="h-8 w-8 rounded-lg"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                title="Log out"
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
