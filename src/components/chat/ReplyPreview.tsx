import { X } from "lucide-react";

interface ReplyPreviewProps {
  replyTo: {
    id: string;
    senderName: string;
    content: string;
  };
  onCancel: () => void;
}

export function ReplyPreview({ replyTo, onCancel }: ReplyPreviewProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-l-2 border-primary">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">{replyTo.senderName}</p>
        <p className="text-sm text-muted-foreground truncate">{replyTo.content}</p>
      </div>
      <button
        onClick={onCancel}
        className="p-1 rounded-full hover:bg-muted transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
