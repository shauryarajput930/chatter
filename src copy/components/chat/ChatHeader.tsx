import { useState, useEffect, useRef } from "react";
import { Avatar } from "./Avatar";
import { MoreVertical, Phone, Video, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatHeaderProps {
  name: string;
  photo?: string;
  online?: boolean;
  lastSeen?: string;
  onBack?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onDeleteChat?: () => void;
}

export function ChatHeader({ 
  name, 
  photo, 
  online = false, 
  lastSeen,
  onBack,
  onVideoCall,
  onVoiceCall,
  onDeleteChat,
}: ChatHeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteChat = () => {
    console.log("handleDeleteChat called, onDeleteChat:", onDeleteChat);
    onDeleteChat?.();
    setShowDeleteDialog(false);
    setShowDropdown(false);
  };
  return (
    <div className="flex items-center gap-4 p-4 bg-card border-b border-border shadow-soft">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="lg:hidden rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}
      
      <Avatar name={name} imageUrl={photo} size="lg" online={online} showStatus />
      
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-foreground truncate">{name}</h2>
        <p className="text-sm text-muted-foreground">
          {online ? (
            <span className="text-status-online font-medium">Online</span>
          ) : lastSeen ? (
            `Last seen ${lastSeen}`
          ) : (
            "Offline"
          )}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl hover:bg-primary/10 hover:text-primary"
          onClick={onVoiceCall}
        >
          <Phone className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl hover:bg-primary/10 hover:text-primary"
          onClick={onVideoCall}
        >
          <Video className="w-5 h-5" />
        </Button>
        
        {/* Custom Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
          
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
              <button
                onClick={() => {
                  console.log("Delete chat clicked");
                  setShowDeleteDialog(true);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
              >
                <Trash2 className="w-4 h-4" />
                Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Chat Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone 
              and will remove all messages permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChat}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
