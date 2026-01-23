import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { Trash2, Reply, File, Download } from "lucide-react";
import { useState } from "react";
import { MessageReactions } from "./MessageReactions";
import { MessageStatus, MessageDeliveryStatus } from "./MessageStatus";

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface ChatBubbleProps {
  message: string;
  timestamp: string;
  senderName: string;
  senderPhoto?: string;
  isSelf: boolean;
  deliveryStatus?: MessageDeliveryStatus;
  isDeleted?: boolean;
  onDelete?: () => void;
  onReply?: () => void;
  reactions?: Reaction[];
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  replyTo?: { senderName: string; content: string } | null;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export function ChatBubble({
  message,
  timestamp,
  senderName,
  senderPhoto,
  isSelf,
  deliveryStatus = "sent",
  isDeleted = false,
  onDelete,
  onReply,
  reactions = [],
  onAddReaction,
  onRemoveReaction,
  replyTo,
  fileUrl,
  fileName,
  fileType,
}: ChatBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const isImage = fileType?.startsWith("image/");

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[80%] animate-fade-in",
        isSelf ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
      onMouseEnter={() => !isDeleted && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isSelf && (
        <Avatar name={senderName} imageUrl={senderPhoto} size="sm" />
      )}
      
      <div className={cn("flex flex-col", isSelf ? "items-end" : "items-start")}>
        {!isSelf && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {senderName}
          </span>
        )}
        
        <div className="relative group">
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl shadow-soft relative",
              isSelf
                ? "bg-chat-self text-chat-self-foreground rounded-tr-md"
                : "bg-chat-other text-chat-other-foreground rounded-tl-md",
              isDeleted && "italic opacity-70"
            )}
          >
            {/* Reply Preview */}
            {replyTo && !isDeleted && (
              <div className="mb-2 pb-2 border-b border-current/20">
                <p className="text-xs font-medium opacity-70">{replyTo.senderName}</p>
                <p className="text-xs opacity-60 truncate max-w-[200px]">{replyTo.content}</p>
              </div>
            )}
            
            {isDeleted ? (
              <span className="text-sm">This message was deleted</span>
            ) : (
              <>
                {/* File Attachment */}
                {fileUrl && (
                  <div className="mb-2">
                    {isImage ? (
                      <img
                        src={fileUrl}
                        alt={fileName || "Image"}
                        className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(fileUrl, "_blank")}
                      />
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
                      >
                        <File className="w-5 h-5" />
                        <span className="text-sm truncate max-w-[150px]">{fileName}</span>
                        <Download className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
              </>
            )}
          </div>
          
          {/* Action Buttons */}
          {showActions && !isDeleted && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 animate-scale-in",
              isSelf ? "-left-16" : "-right-16"
            )}>
              {onReply && (
                <button
                  onClick={onReply}
                  className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>
              )}
              {isSelf && onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Reactions */}
        {!isDeleted && (onAddReaction || reactions.length > 0) && (
          <MessageReactions
            reactions={reactions}
            onAddReaction={onAddReaction || (() => {})}
            onRemoveReaction={onRemoveReaction || (() => {})}
          />
        )}
        
        <div className={cn(
          "flex items-center gap-1 mt-1 px-1",
          isSelf ? "flex-row-reverse" : ""
        )}>
          <span className="text-[10px] text-muted-foreground">{timestamp}</span>
          {isSelf && !isDeleted && (
            <MessageStatus status={deliveryStatus} />
          )}
        </div>
      </div>
    </div>
  );
}
