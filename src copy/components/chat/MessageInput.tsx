import { useState, useRef } from "react";
import { Send, Paperclip, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "./EmojiPicker";
import { ReplyPreview } from "./ReplyPreview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSend: (message: string, file?: { url: string; name: string; type: string }, replyToId?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  userId?: string;
  replyTo?: { id: string; senderName: string; content: string } | null;
  onCancelReply?: () => void;
}

export function MessageInput({ onSend, onTyping, disabled, userId, replyTo, onCancelReply }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || file) {
      onSend(message.trim(), file || undefined, replyTo?.id);
      setMessage("");
      setFile(null);
      onTyping?.(false);
      onCancelReply?.();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping?.(e.target.value.length > 0);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !userId) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-files")
        .getPublicUrl(fileName);

      setFile({
        url: publicUrl,
        name: selectedFile.name,
        type: selectedFile.type,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage = file?.type.startsWith("image/");

  return (
    <div className="bg-card border-t border-border">
      {replyTo && (
        <ReplyPreview replyTo={replyTo} onCancel={onCancelReply!} />
      )}
      
      {file && (
        <div className="px-4 pt-3">
          <div className="relative inline-flex items-center gap-2 p-2 bg-muted rounded-lg">
            {isImage ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <File className="w-8 h-8 text-muted-foreground" />
            )}
            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
            <button
              onClick={clearFile}
              className="p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleChange}
              placeholder="Type a message..."
              disabled={disabled}
              className={cn(
                "w-full h-12 px-4 pr-12 rounded-2xl bg-muted shadow-neumorphic-inset",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "transition-all duration-200"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
          
          <Button
            type="submit"
            size="icon"
            disabled={(!message.trim() && !file) || disabled || uploading}
            className="rounded-xl h-12 w-12 shadow-soft"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
