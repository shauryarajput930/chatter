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
    <aside className="w-full h-screen flex flex-col bg-card shadow-neumorphic">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-foreground">Chatter</h1>
              <p className="text-xs text-muted-foreground">Connect with friends</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-12 pl-12 pr-4 rounded-2xl bg-muted/50 shadow-neumorphic-inset",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background",
              "transition-all duration-300"
            )}
          />
        </div>
      </div>

      {/* Messages Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Messages</span>
            <p className="text-xs text-muted-foreground">{conversations.length} conversations</p>
          </div>
        </div>
        <Button
          onClick={onNewChat}
          className="h-10 w-10 rounded-2xl bg-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          title="Start new conversation"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {searchQuery 
                ? "Try searching with different keywords" 
                : "Start your first conversation to see it here"
              }
            </p>
            {!searchQuery && (
              <Button onClick={onNewChat} className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
            )}
          </div>
        ) : (
          <ConversationList
            conversations={filteredConversations}
            activeConversationId={activeConversationId}
            currentProfileId={currentProfile?.id}
            onSelectConversation={onSelectConversation}
          />
        )}
      </div>

      {/* User Section */}
      {currentProfile && (
        <div className="p-6 border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="ring-2 ring-background ring-offset-2 ring-offset-background rounded-full">
                <Avatar
                  name={currentProfile.name}
                  imageUrl={currentProfile.photo_url || undefined}
                  size="lg"
                  online
                  showStatus
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {currentProfile.name}
              </p>
              {currentProfile.username && (
                <p className="text-sm text-muted-foreground truncate font-medium">
                  @{currentProfile.username}
                </p>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {currentProfile.email}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/call-history')}
                  className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                  title="Call History"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/settings')}
                  className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
