import { useRef, useEffect, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatBubble } from "./ChatBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";

import { MessageDeliveryStatus } from "./MessageStatus";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  isDeleted?: boolean;
  deliveryStatus?: MessageDeliveryStatus;
  replyToId?: string;
  replyTo?: { senderName: string; content: string } | null;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface ChatRoomProps {
  roomName: string;
  roomPhoto?: string;
  roomUserId?: string;
  messages: Message[];
  currentUserId: string;
  typingUsers?: Array<{ name: string; photo?: string }>;
  isOnline?: boolean;
  lastSeen?: string;
  onSendMessage: (content: string, file?: File) => void;
  onDeleteMessage: (messageId: string) => void;
  onClearChat?: () => void;
  onBack?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  reactions?: Record<string, { emoji: string; count: number; hasReacted: boolean }[]>;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onReplyToMessage?: (message: Message) => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

export function ChatRoom({
  roomName,
  roomPhoto,
  roomUserId,
  messages,
  currentUserId,
  typingUsers = [],
  isOnline = false,
  lastSeen,
  onSendMessage,
  onDeleteMessage,
  onClearChat,
  onBack,
  onVideoCall,
  onVoiceCall,
  reactions = {},
  onAddReaction,
  onRemoveReaction,
}: ChatRoomProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; senderName: string; content: string } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      senderName: message.senderName,
      content: message.text,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader
        name={roomName}
        photo={roomPhoto}
        online={isOnline}
        lastSeen={lastSeen}
        userId={roomUserId}
        onBack={onBack}
        onVideoCall={onVideoCall}
        onVoiceCall={onVoiceCall}
        onClearChat={onClearChat}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-4 shadow-soft">
              <span className="text-3xl">👋</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Start the conversation</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Say hello and start chatting with {roomName}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message.text}
                timestamp={message.timestamp}
                senderName={message.senderName}
                senderPhoto={message.senderPhoto}
                isSelf={message.senderId === currentUserId}
                deliveryStatus={message.deliveryStatus}
                isDeleted={message.isDeleted}
                replyTo={message.replyTo}
                fileUrl={message.fileUrl}
                fileName={message.fileName}
                fileType={message.fileType}
                reactions={reactions[message.id] || []}
                onDelete={
                  message.senderId === currentUserId && !message.isDeleted
                    ? () => onDeleteMessage(message.id)
                    : undefined
                }
                onReply={() => handleReply(message)}
                onAddReaction={onAddReaction ? (emoji) => onAddReaction(message.id, emoji) : undefined}
                onRemoveReaction={onRemoveReaction ? (emoji) => onRemoveReaction(message.id, emoji) : undefined}
              />
            ))}
            
            {typingUsers && typingUsers.length > 0 && (
              <TypingIndicator
                userName={typingUsers[0].name}
                userPhoto={typingUsers[0].photo}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={onSendMessage}
        userId={currentUserId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
