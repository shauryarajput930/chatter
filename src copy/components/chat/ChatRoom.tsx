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
  messages: Message[];
  currentUserId: string;
  typingUser?: { name: string; photo?: string } | null;
  isOnline?: boolean;
  lastSeen?: string;
  onSendMessage: (message: string, file?: { url: string; name: string; type: string }, replyToId?: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onDeleteChat?: () => void;
  reactions?: Record<string, { emoji: string; count: number; hasReacted: boolean }[]>;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
}

export function ChatRoom({
  roomName,
  roomPhoto,
  messages,
  currentUserId,
  typingUser,
  isOnline = false,
  lastSeen,
  onSendMessage,
  onDeleteMessage,
  onTyping,
  onBack,
  onVideoCall,
  onVoiceCall,
  onDeleteChat,
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
  }, [messages, typingUser]);

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
        onBack={onBack}
        onVideoCall={onVideoCall}
        onVoiceCall={onVoiceCall}
        onDeleteChat={onDeleteChat}
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
            
            {typingUser && (
              <TypingIndicator
                userName={typingUser.name}
                userPhoto={typingUser.photo}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={onSendMessage}
        onTyping={onTyping}
        userId={currentUserId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
