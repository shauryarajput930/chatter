import { Avatar } from "./Avatar";

interface TypingIndicatorProps {
  userName: string;
  userPhoto?: string;
}

export function TypingIndicator({ userName, userPhoto }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <Avatar name={userName} imageUrl={userPhoto} size="sm" />
      
      <div className="bg-chat-other px-4 py-3 rounded-2xl rounded-tl-md shadow-soft">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
        </div>
      </div>
      
      <span className="text-xs text-muted-foreground">{userName} is typing...</span>
    </div>
  );
}
