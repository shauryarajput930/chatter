import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useTypingPresence } from "@/hooks/useTypingPresence";
import { useVideoCalls } from "@/hooks/useVideoCalls";
import { DMSidebar } from "@/components/layout/DMSidebar";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { IncomingCallDialog } from "@/components/call/IncomingCallDialog";
import { VideoCallScreen } from "@/components/call/VideoCallScreen";
import { format } from "date-fns";
import { MessageDeliveryStatus } from "@/components/chat/MessageStatus";

// Lazy load heavy components
const ChatRoom = lazy(() => import("@/components/chat/ChatRoom").then(module => ({ default: module.ChatRoom })));

export default function Messages() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    allProfiles,
    loading: messagesLoading,
    startConversation,
    sendMessage,
    deleteMessage,
    markAsDelivered,
    markAsRead,
    markConversationAsRead,
  } = useDirectMessages();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'friends' | 'chat'>('friends');

  // Typing presence
  const { typingUser, setTyping, stopTyping } = useTypingPresence(
    activeConversation?.id,
    profile
  );

  // Video calls
  const {
    incomingCall,
    activeCall,
    isInCall,
    startCall,
    answerCall,
    declineCall,
    endCall,
  } = useVideoCalls();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Mark incoming messages as delivered and read when conversation is viewed
  useEffect(() => {
    if (activeConversation && profile && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => msg.sender_id !== profile.id && !msg.is_read
      );
      
      unreadMessages.forEach((msg) => {
        // Mark as delivered first
        if (!msg.is_delivered) {
          markAsDelivered(msg.id);
        }
        // Then mark as read
        markAsRead(msg.id);
      });
    }
  }, [activeConversation, profile, messages, markAsDelivered, markAsRead]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSelectConversation = (conversation: typeof activeConversation) => {
    setActiveConversation(conversation);
    setSidebarOpen(false);
    setCurrentView('chat'); // Switch to chat view on mobile
  };

  const handleNewChat = () => {
    setNewChatOpen(true);
  };

  const handleSelectUser = async (profileId: string) => {
    await startConversation(profileId);
    setSidebarOpen(false);
    setCurrentView('chat'); // Switch to chat view on mobile
  };

  const handleBackToFriends = () => {
    setCurrentView('friends');
  };

  const handleSendMessage = async (text: string, file?: { url: string; name: string; type: string }, replyToId?: string) => {
    await stopTyping();
    await sendMessage(text, file, replyToId);
  };

  const handleTyping = (isTyping: boolean) => {
    setTyping(isTyping);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  // Video/Voice call handlers
  const handleVideoCall = async () => {
    if (activeConversation?.other_participant) {
      await startCall(activeConversation.other_participant.id, "video");
    }
  };

  const handleVoiceCall = async () => {
    if (activeConversation?.other_participant) {
      await startCall(activeConversation.other_participant.id, "audio");
    }
  };

  // Determine delivery status based on message state
  const getDeliveryStatus = (msg: typeof messages[0]): MessageDeliveryStatus => {
    if (msg.sending) return "sending";
    if (msg.is_read) return "read";
    if (msg.is_delivered) return "delivered";
    return "sent";
  };

  // Format messages for ChatRoom component
  const formattedMessages = messages.map((msg) => ({
    id: msg.id,
    text: msg.is_deleted ? "This message was deleted" : msg.content,
    timestamp: format(new Date(msg.created_at), "h:mm a"),
    senderId: msg.sender_id,
    senderName: msg.sender?.name || "Unknown",
    senderPhoto: msg.sender?.photo_url || undefined,
    isDeleted: msg.is_deleted,
    deliveryStatus: getDeliveryStatus(msg),
    fileUrl: msg.file_url || undefined,
    fileName: msg.file_name || undefined,
    fileType: msg.file_type || undefined,
    replyTo: msg.reply_to ? { senderName: msg.reply_to.sender_name, content: msg.reply_to.content } : null,
  }));

  if (authLoading || messagesLoading) {
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
      {/* Mobile Layout: Show either friends or chat, not both */}
      <div className="flex w-full lg:hidden">
        {currentView === 'friends' ? (
          /* Friends/Settings Page - Full screen on mobile */
          <div className="w-full">
            <DMSidebar
              conversations={conversations}
              activeConversationId={activeConversation?.id}
              currentProfile={profile}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onLogout={handleLogout}
            />
          </div>
        ) : (
          /* Chat Page - Full screen on mobile with back button */
          <main className="flex-1 h-screen w-full">
            {activeConversation && activeConversation.other_participant ? (
              <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                <ChatRoom
                  roomName={activeConversation.other_participant.name}
                  roomPhoto={activeConversation.other_participant.photo_url || undefined}
                  roomUserId={activeConversation.other_participant.user_id}
                  messages={formattedMessages}
                  currentUserId={profile.id}
                  typingUser={typingUser}
                  isOnline={activeConversation.other_participant.is_online}
                  lastSeen={format(
                    new Date(activeConversation.other_participant.last_seen),
                    "MMM d, h:mm a"
                  )}
                  onSendMessage={handleSendMessage}
                  onDeleteMessage={handleDeleteMessage}
                  onTyping={handleTyping}
                  onBack={handleBackToFriends}
                  onVideoCall={handleVideoCall}
                  onVoiceCall={handleVoiceCall}
                />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-4 shadow-soft">
                    <span className="text-4xl">💬</span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Your Messages
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Send private messages to other users
                  </p>
                  <Button onClick={handleNewChat}>Start a conversation</Button>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Desktop Layout: Show sidebar and chat side by side */}
      <div className="hidden lg:flex lg:w-full">
        {/* Desktop Sidebar */}
        <div className="w-80 border-r border-border">
          <DMSidebar
            conversations={conversations}
            activeConversationId={activeConversation?.id}
            currentProfile={profile}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onLogout={handleLogout}
          />
        </div>

        {/* Desktop Chat Area */}
        <main className="flex-1 h-screen">
          {activeConversation && activeConversation.other_participant ? (
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <ChatRoom
                roomName={activeConversation.other_participant.name}
                roomPhoto={activeConversation.other_participant.photo_url || undefined}
                roomUserId={activeConversation.other_participant.user_id}
                messages={formattedMessages}
                currentUserId={profile.id}
                typingUser={typingUser}
                isOnline={activeConversation.other_participant.is_online}
                lastSeen={format(
                  new Date(activeConversation.other_participant.last_seen),
                  "MMM d, h:mm a"
                )}
                onSendMessage={handleSendMessage}
                onDeleteMessage={handleDeleteMessage}
                onTyping={handleTyping}
                onBack={() => {}} // No back button needed on desktop
                onVideoCall={handleVideoCall}
                onVoiceCall={handleVoiceCall}
              />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Your Messages
                </h2>
                <p className="text-muted-foreground mb-4">
                  Send private messages to other users
                </p>
                <Button onClick={handleNewChat}>Start a conversation</Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Incoming Call Dialog */}
      {incomingCall && incomingCall.caller && (
        <IncomingCallDialog
          callerName={incomingCall.caller.name}
          callerPhoto={incomingCall.caller.photo_url}
          callType={incomingCall.call_type}
          onAnswer={answerCall}
          onDecline={declineCall}
        />
      )}

      {/* Active Video Call Screen */}
      {isInCall && activeCall && (
        <VideoCallScreen
          roomName={activeCall.room_name}
          remoteName={
            activeCall.caller?.id === profile.id
              ? activeCall.callee?.name || "Unknown"
              : activeCall.caller?.name || "Unknown"
          }
          remotePhoto={
            activeCall.caller?.id === profile.id
              ? activeCall.callee?.photo_url
              : activeCall.caller?.photo_url
          }
          callType={activeCall.call_type}
          onEndCall={endCall}
        />
      )}

      {/* New Chat Dialog */}
      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        profiles={allProfiles}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}
