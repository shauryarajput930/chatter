import { useState, useEffect } from "react";
import { GroupSidebar } from "@/components/layout/GroupSidebar";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
import { GroupMembersDialog } from "@/components/chat/GroupMembersDialog";
import { AddMemberDialog } from "@/components/chat/AddMemberDialog";
import { VideoCallScreen } from "@/components/call/VideoCallScreen";
import { useNavigate } from "react-router-dom";
import { Menu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useGroupChats } from "@/hooks/useGroupChats";
import { format } from "date-fns";

export default function Chat() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const {
    groups,
    activeGroup,
    setActiveGroup,
    messages,
    members,
    allProfiles,
    loading: groupsLoading,
    createGroup,
    sendMessage,
    deleteMessage,
    deleteGroupChat,
    addMembers,
    refreshGroups,
  } = useGroupChats();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeCall, setActiveCall] = useState<{
    type: "video" | "audio";
    targetUserId: string;
    targetUserName: string;
    targetUserPhoto?: string | null;
  } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleCreateGroup = async (groupName: string, memberIds: string[]) => {
    setIsCreatingGroup(true);
    try {
      await createGroup(groupName, memberIds);
      setCreateGroupOpen(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSelectGroup = (group: typeof groups[0]) => {
    setActiveGroup(group.id);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (text: string, file?: { url: string; name: string; type: string }, replyToId?: string) => {
    await sendMessage(text, file, replyToId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  const handleShowMembers = () => {
    setMembersDialogOpen(true);
  };

  const handleAddMembers = async (memberIds: string[]) => {
    if (activeGroup) {
      await addMembers(activeGroup, memberIds);
    }
  };

  const handleDeleteChat = async () => {
    console.log("Chat page handleDeleteChat called, activeGroup:", activeGroup);
    if (activeGroup) {
      await deleteGroupChat(activeGroup);
    }
  };

  const handleVideoCall = () => {
    // For demo, call the first member in the group
    if (members.length > 0) {
      const targetMember = members[0];
      setActiveCall({
        type: "video",
        targetUserId: targetMember.profile_id,
        targetUserName: targetMember.profile?.name || "Unknown",
        targetUserPhoto: targetMember.profile?.photo_url,
      });
    }
  };

  const handleVoiceCall = () => {
    // For demo, call the first member in the group
    if (members.length > 0) {
      const targetMember = members[0];
      setActiveCall({
        type: "audio",
        targetUserId: targetMember.profile_id,
        targetUserName: targetMember.profile?.name || "Unknown",
        targetUserPhoto: targetMember.profile?.photo_url,
      });
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const activeGroupData = groups.find((g) => g.id === activeGroup);

  // Format messages for ChatRoom
  const formattedMessages = messages.map((msg) => ({
    id: msg.id,
    text: msg.is_deleted ? "This message was deleted" : msg.content,
    timestamp: format(new Date(msg.created_at), "h:mm a"),
    senderId: msg.sender_id,
    senderName: msg.sender?.name || "Unknown",
    senderPhoto: msg.sender?.photo_url || undefined,
    isDeleted: msg.is_deleted,
    fileUrl: msg.file_url || undefined,
    fileName: msg.file_name || undefined,
    fileType: msg.file_type || undefined,
    replyTo: msg.reply_to ? { senderName: msg.reply_to.sender_name, content: msg.reply_to.content } : null,
  }));

  if (authLoading || groupsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Debug Sidebar Toggle - Remove this later */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-red-500 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? 'Hide' : 'Show'} Sidebar
      </Button>

      {/* Group Action Buttons */}
      <div className="fixed top-16 right-4 z-50 space-y-2">
        {/* Create New Group */}
        <Button
          variant="ghost"
          size="sm"
          className="bg-blue-500 text-white w-full"
          onClick={() => setCreateGroupOpen(true)}
        >
          ➕ Create New Group
        </Button>
        
        {/* Add Members to Existing Group */}
        {activeGroup && (
          <Button
            variant="ghost"
            size="sm"
            className="bg-green-500 text-white w-full"
            onClick={() => setAddMemberDialogOpen(true)}
          >
            👥 Add Member
          </Button>
        )}
        
        {/* View Members */}
        {activeGroup && (
          <Button
            variant="ghost"
            size="sm"
            className="bg-purple-500 text-white w-full"
            onClick={handleShowMembers}
          >
            👁️ View Members
          </Button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl shadow-soft bg-card"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative z-40 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <GroupSidebar
          groups={groups}
          activeGroupId={activeGroup}
          onSelectGroup={handleSelectGroup}
          onNewGroup={() => setCreateGroupOpen(true)}
          currentProfile={profile}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 h-screen flex flex-col">
        {activeGroupData ? (
          <>
            {/* Group Header */}
            <div className="bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {activeGroupData.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShowMembers}
                className="rounded-lg"
                title="View members"
              >
                <Users className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Room */}
            <ChatRoom
              roomName={activeGroupData.name}
              messages={formattedMessages}
              currentUserId={profile.id}
              typingUser={null}
              isOnline={true}
              onSendMessage={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              onDeleteChat={handleDeleteChat}
              onVideoCall={handleVideoCall}
              onVoiceCall={handleVoiceCall}
              onBack={() => setSidebarOpen(true)}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Groups Yet
              </h2>
              <p className="text-muted-foreground mb-4">
                Create a new group or ask someone to add you
              </p>
              <Button onClick={() => setCreateGroupOpen(true)} className="rounded-xl">
                Create Group
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        availableProfiles={allProfiles}
        currentUserId={profile.id}
        onCreateGroup={handleCreateGroup}
        isLoading={isCreatingGroup}
      />

      {/* Group Members Dialog */}
      {activeGroupData && (
        <GroupMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          groupName={activeGroupData.name}
          members={members}
          currentUserId={profile.id}
          isGroupAdmin={activeGroupData.created_by === profile.id}
        />
      )}
      
      {/* Active Call Overlay */}
      {activeCall && (
        <VideoCallScreen
          roomName={`call-${profile.id}-${activeCall.targetUserId}`}
          remoteName={activeCall.targetUserName}
          remotePhoto={activeCall.targetUserPhoto}
          callType={activeCall.type}
          calleeId={activeCall.targetUserId}
          currentUserId={profile.id}
          onEndCall={handleEndCall}
        />
      )}
      
      {/* Add Member Dialog */}
      {activeGroup && (
        <AddMemberDialog
          open={addMemberDialogOpen}
          onOpenChange={setAddMemberDialogOpen}
          groupId={activeGroup}
          currentMemberIds={members.map(m => m.profile_id)}
          onAddMembers={handleAddMembers}
        />
      )}
    </div>
  );
}
