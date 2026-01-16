import { Avatar } from "./Avatar";
import { MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  name: string;
  photo?: string;
  online?: boolean;
  lastSeen?: string;
  onBack?: () => void;
}

export function ChatHeader({ 
  name, 
  photo, 
  online = false, 
  lastSeen,
  onBack 
}: ChatHeaderProps) {
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
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Video className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
