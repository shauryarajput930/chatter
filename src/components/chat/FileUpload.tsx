import { useState, useRef } from "react";
import { Paperclip, X, File, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: { url: string; name: string; type: string }) => void;
  userId: string;
}

export function FileUpload({ onFileSelect, userId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-files")
        .getPublicUrl(fileName);

      const fileData = {
        url: publicUrl,
        name: file.name,
        type: file.type,
      };

      setPreview(fileData);
      onFileSelect(fileData);
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

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage = preview?.type.startsWith("image/");

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      
      {preview ? (
        <div className="relative inline-flex items-center gap-2 p-2 bg-muted rounded-lg">
          {isImage ? (
            <img
              src={preview.url}
              alt={preview.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <File className="w-8 h-8 text-muted-foreground" />
          )}
          <span className="text-sm truncate max-w-[100px]">{preview.name}</span>
          <button
            onClick={clearPreview}
            className="p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          <Paperclip className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
