import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data - will be replaced with real data from backend
const mockRooms = [
  { id: "1", name: "General Chat", memberCount: 24, createdAt: "Jan 10, 2024" },
  { id: "2", name: "Design Team", memberCount: 8, createdAt: "Dec 15, 2023" },
  { id: "3", name: "Developers", memberCount: 15, createdAt: "Nov 20, 2023" },
  { id: "4", name: "Marketing", memberCount: 6, createdAt: "Jan 5, 2024" },
  { id: "5", name: "Project Alpha", memberCount: 4, createdAt: "Jan 12, 2024" },
];

const mockMessages: Record<string, Array<{
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  isDeleted?: boolean;
  isRead?: boolean;
}>> = {
  "1": [
    {
      id: "m1",
      text: "Hey everyone! 👋 Welcome to the General Chat.",
      timestamp: "10:30 AM",
      senderId: "user2",
      senderName: "Sarah Chen",
      isRead: true,
    },
    {
      id: "m2",
      text: "Thanks for having us! Excited to be here.",
      timestamp: "10:32 AM",
      senderId: "user1",
      senderName: "You",
      isRead: true,
    },
    {
      id: "m3",
      text: "Great to see everyone online! Let's make this a productive week. 🚀",
      timestamp: "10:35 AM",
      senderId: "user3",
      senderName: "Mike Johnson",
      isRead: true,
    },
    {
      id: "m4",
      text: "Absolutely! I've got some exciting updates to share about the new feature we've been working on.",
      timestamp: "10:38 AM",
      senderId: "user2",
      senderName: "Sarah Chen",
      isRead: true,
    },
    {
      id: "m5",
      text: "Can't wait to hear about it! Should we schedule a quick sync?",
      timestamp: "10:40 AM",
      senderId: "user1",
      senderName: "You",
      isRead: false,
    },
  ],
  "2": [
    {
      id: "m1",
      text: "New design mockups are ready for review! 🎨",
      timestamp: "9:15 AM",
      senderId: "user4",
      senderName: "Alex Rivera",
      isRead: true,
    },
    {
      id: "m2",
      text: "They look amazing! Love the new color scheme.",
      timestamp: "9:20 AM",
      senderId: "user1",
      senderName: "You",
      isRead: true,
    },
  ],
};

const currentUser = {
  id: "user1",
  name: "John Doe",
  email: "john@example.com",
};

export default function Chat() {
  const navigate = useNavigate();
  const [activeRoomId, setActiveRoomId] = useState<string>("1");
  const [messages, setMessages] = useState(mockMessages);
  const [typingUser, setTypingUser] = useState<{ name: string; photo?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeRoom = mockRooms.find((r) => r.id === activeRoomId);
  const roomMessages = messages[activeRoomId] || [];

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: `m${Date.now()}`,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderId: currentUser.id,
      senderName: "You",
      isRead: false,
    };

    setMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage],
    }));

    // Simulate receiving a reply
    setTimeout(() => {
      setTypingUser({ name: "Sarah Chen" });
      setTimeout(() => {
        setTypingUser(null);
        const reply = {
          id: `m${Date.now()}`,
          text: "Got it! Thanks for the update. 👍",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          senderId: "user2",
          senderName: "Sarah Chen",
          isRead: true,
        };
        setMessages((prev) => ({
          ...prev,
          [activeRoomId]: [...(prev[activeRoomId] || []), reply],
        }));
      }, 2000);
    }, 1000);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [activeRoomId]: prev[activeRoomId].map((msg) =>
        msg.id === messageId ? { ...msg, isDeleted: true } : msg
      ),
    }));
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleNewGroup = () => {
    // Will open create group dialog
    alert("Create new group - will be implemented with backend");
  };

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
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
        <Sidebar
          rooms={mockRooms}
          activeRoomId={activeRoomId}
          onSelectRoom={handleSelectRoom}
          onNewGroup={handleNewGroup}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 h-screen">
        {activeRoom ? (
          <ChatRoom
            roomName={activeRoom.name}
            messages={roomMessages}
            currentUserId={currentUser.id}
            typingUser={typingUser}
            isOnline={true}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onBack={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Select a chat
              </h2>
              <p className="text-muted-foreground">
                Choose a group from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
