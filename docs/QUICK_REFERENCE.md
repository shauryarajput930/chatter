# 🚀 Chatter - Quick Reference Guide

Complete quick reference for all Chatter features and functionality.

## 🎯 Core Features Quick Access

### 💬 Chat System
```typescript
// Send Message
const { sendMessage } = useGroupChats();
await sendMessage({
  groupId: "group123",
  content: "Hello world!"
});

// Delete Message
await deleteMessage("message123");

// Create Group
await createGroup({
  name: "Team Chat",
  memberIds: ["user1", "user2"]
});
```

### 👥 Group Management
```typescript
// Add Members
const { addMembers } = useGroupChats();
await addMembers("group123", ["user4", "user5"]);

// Delete Group
await deleteGroupChat("group123");

// Get Group Members
const { members } = useGroupChats();
// members array contains all group members
```

### 📹 Video/Audio Calls
```typescript
// Start Video Call
const { startCall } = useWebRTC();
await startCall({
  targetUserId: "user123",
  callType: "video"
});

// Start Voice Call
await startCall({
  targetUserId: "user123", 
  callType: "audio"
});

// End Call
const { endCall } = useWebRTC();
await endCall();
```

### 🟢 Real-Time Presence
```typescript
// Use Presence Hook
const { setPresence, isOnline, lastSeen } = useRealtimePresence();

// Manual Status Update
await setPresence(true); // Set as online
await setPresence(false); // Set as offline

// Listen for Presence Updates
window.addEventListener('presence_update', (event) => {
  const { user_id, is_online, last_seen } = event.detail;
  console.log(`User ${user_id} is ${is_online ? 'online' : 'offline'}`);
});
```

### 🔔 Push Notifications
```typescript
// Enable Notifications
const { subscribe } = usePushNotifications();
await subscribe();

// Disable Notifications
const { unsubscribe } = usePushNotifications();
await unsubscribe();

// Check Subscription Status
const { isSubscribed } = usePushNotifications();
console.log('Notifications enabled:', isSubscribed);
```

## 🎨 UI Components Quick Reference

### Chat Components
```tsx
// Chat Room
<ChatRoom
  messages={messages}
  onSendMessage={sendMessage}
  onDeleteMessage={deleteMessage}
  onVideoCall={handleVideoCall}
  onVoiceCall={handleVoiceCall}
/>

// Chat Header
<ChatHeader
  roomName="Group Chat"
  onDeleteChat={handleDeleteChat}
  onShowMembers={handleShowMembers}
/>

// Message Input
<MessageInput
  onSendMessage={sendMessage}
  placeholder="Type a message..."
/>
```

### Group Components
```tsx
// Create Group Dialog
<CreateGroupDialog
  open={createGroupOpen}
  onOpenChange={setCreateGroupOpen}
  onCreateGroup={handleCreateGroup}
  availableProfiles={allProfiles}
/>

// Group Members Dialog
<GroupMembersDialog
  open={membersDialogOpen}
  onOpenChange={setMembersDialogOpen}
  members={members}
  currentUserId={user.id}
  onRemoveMember={handleRemoveMember}
/>

// Add Member Dialog
<AddMemberDialog
  open={addMemberDialogOpen}
  onOpenChange={setAddMemberDialogOpen}
  groupId={activeGroup}
  currentMemberIds={members.map(m => m.profile_id)}
  onAddMembers={handleAddMembers}
/>
```

### Call Components
```tsx
// Video Call Screen
<VideoCallScreen
  roomName={`call-${user.id}-${targetUserId}`}
  remoteName="John Doe"
  remotePhoto="https://example.com/photo.jpg"
  callType="video"
  calleeId="user123"
  currentUserId={user.id}
  onEndCall={handleEndCall}
/>

// Call Status
<CallStatus
  status="ringing"
  remoteName="John Doe"
  callType="video"
/>
```

## 🛠️ Hooks Reference

### useGroupChats
```typescript
const {
  groups,              // Array of groups
  activeGroup,         // Current active group ID
  setActiveGroup,      // Set active group
  messages,            // Messages for active group
  members,             // Members for active group
  allProfiles,         // All user profiles
  loading,             // Loading state
  createGroup,         // Create new group
  sendMessage,         // Send message
  deleteMessage,       // Delete message
  deleteGroupChat,     // Delete group
  addMembers,          // Add members to group
  refreshGroups        // Refresh groups list
} = useGroupChats();
```

### useAuth
```typescript
const {
  user,                // Current user
  profile,             // User profile
  session,             // User session
  loading,             // Auth loading state
  signIn,              // Sign in function
  signUp,              // Sign up function
  signOut,             // Sign out function
  resetPassword        // Reset password function
} = useAuth();
```

### useWebRTC
```typescript
const {
  localStream,         // Local media stream
  remoteStream,        // Remote media stream
  isCallActive,        // Call active status
  callStatus,          // Current call status
  startCall,           // Start a call
  endCall,             // End a call
  toggleMute,          // Toggle mute
  toggleVideo          // Toggle video
} = useWebRTC();
```

### useRealtimePresence
```typescript
const {
  setPresence,         // Set user presence
  isOnline,            // Current user online status
  lastSeen             // Last seen timestamp
} = useRealtimePresence();
```

### usePushNotifications
```typescript
const {
  subscribe,           // Subscribe to notifications
  unsubscribe,         // Unsubscribe from notifications
  isSubscribed,        // Subscription status
  permission           // Notification permission status
} = usePushNotifications();
```

## 🎯 Utility Functions

### Presence Utils
```typescript
import { 
  formatLastSeen, 
  getOnlineStatusText, 
  getOnlineStatusColor,
  getOnlineStatusBgColor 
} from '@/utils/presenceUtils';

// Format last seen time
formatLastSeen("2026-01-23T10:00:00Z"); // "2 hours ago"

// Get status text
getOnlineStatusText(true, "2026-01-23T10:00:00Z"); // "Online"
getOnlineStatusText(false, "2026-01-23T10:00:00Z"); // "Last seen 2 hours ago"

// Get status colors
getOnlineStatusColor(true); // "text-green-500"
getOnlineStatusBgColor(true); // "bg-green-500"
```

### Date Utils
```typescript
import { format, formatDistanceToNow } from 'date-fns';

// Format date
format(new Date(), 'PPp'); // "Jan 23, 2026 at 10:30 AM"

// Format relative time
formatDistanceToNow(new Date(), { addSuffix: true }); // "2 hours ago"
```

## 🎨 Styling Quick Reference

### Tailwind Classes
```css
/* Common Layout Classes */
.flex           /* Flex container */
.flex-1         /* Flex grow */
.flex-col       /* Flex column */
.items-center   /* Align items center */
.justify-center /* Justify content center */
.gap-4          /* Gap between items */

/* Card Styles */
.bg-card        /* Card background */
.shadow-soft    /* Soft shadow */
.rounded-xl     /* Extra large rounded corners */
.p-4            /* Padding */

/* Button Styles */
.bg-primary     /* Primary background */
.text-primary-foreground /* Primary text */
.hover:bg-primary/80 /* Hover state */
.rounded-xl     /* Rounded corners */
.px-4 py-2      /* Padding */

/* Status Colors */
.text-green-500 /* Online status */
.text-gray-400 /* Offline status */
.bg-green-500  /* Online background */
.bg-gray-400   /* Offline background */
```

### Component Styling
```tsx
// Neumorphic Card
<div className="bg-card shadow-neumorphic rounded-xl p-4">
  {/* Content */}
</div>

// Hover Effect
<button className="hover:bg-accent/50 transition-colors">
  {/* Button content */}
</button>

// Status Indicator
<div className="w-2 h-2 rounded-full bg-green-500"></div>
```

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=Chatter
VITE_APP_VERSION=1.0.0
```

### Database Schema
```sql
-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  photo_url TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Chats Table
CREATE TABLE group_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Members Table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES group_chats(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin' or 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Messages Table
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES group_chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  reply_to UUID REFERENCES group_messages(id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🐛 Common Issues & Solutions

### Presence Issues
```typescript
// Problem: Status not updating
// Solution: Check browser events
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setPresence(false);
    } else {
      setPresence(true);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [setPresence]);
```

### Call Issues
```typescript
// Problem: Call not connecting
// Solution: Check permissions
const startCall = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    // Proceed with call
  } catch (error) {
    console.error('Media access denied:', error);
  }
};
```

### Notification Issues
```typescript
// Problem: Notifications not working
// Solution: Check permission and service worker
const checkNotificationSupport = () => {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }
  
  if (!('serviceWorker' in navigator)) {
    console.error('This browser does not support service workers');
    return false;
  }
  
  return true;
};
```

## 🚀 Performance Tips

### React Optimization
```tsx
// Use React.memo for expensive components
const MessageBubble = React.memo(({ message }) => {
  return <div>{message.content}</div>;
});

// Use useMemo for expensive calculations
const filteredMessages = useMemo(() => {
  return messages.filter(msg => !msg.is_deleted);
}, [messages]);

// Use useCallback for stable function references
const handleSendMessage = useCallback((content: string) => {
  sendMessage(content);
}, [sendMessage]);
```

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX idx_group_messages_sender_id ON group_messages(sender_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_profile_id ON group_members(profile_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
```

## 📱 Mobile Considerations

### Responsive Design
```tsx
// Mobile-first approach
<div className="flex flex-col lg:flex-row gap-4">
  <Sidebar className="w-full lg:w-64" />
  <MainContent className="flex-1" />
</div>

// Touch-friendly buttons
<button className="min-h-[44px] min-w-[44px] p-4">
  {/* Button content */}
</button>
```

### Mobile-Specific Features
```typescript
// Handle mobile-specific events
useEffect(() => {
  const handlePageHide = () => {
    setPresence(false);
  };
  
  window.addEventListener('pagehide', handlePageHide);
  return () => window.removeEventListener('pagehide', handlePageHide);
}, [setPresence]);
```

---

## 🎯 Quick Access Links

### Documentation
- **[README.md](./README.md)** - Complete documentation
- **[DOCS_INDEX.md](./DOCS_INDEX.md)** - Documentation index
- **[REALTIME_PRESENCE_IMPLEMENTATION.md](./REALTIME_PRESENCE_IMPLEMENTATION.md)** - Presence system

### Key Files
- **`src/hooks/useGroupChats.tsx`** - Group chat logic
- **`src/hooks/useRealtimePresence.tsx`** - Presence system
- **`src/hooks/useWebRTC.tsx`** - Video calling
- **`src/components/chat/`** - Chat components
- **`src/components/call/`** - Call components

---

**🚀 Chatter Quick Reference - Everything you need in one place!**

*Last Updated: January 2026*