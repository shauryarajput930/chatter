import type { CallStatus } from "@/hooks/useRealTimeCall";
import { Avatar } from "@/components/chat/Avatar";
import { cn } from "@/lib/utils";

interface CallStatusProps {
  status: CallStatus;
  isOnline: boolean;
  remoteName: string;
  remotePhoto?: string | null;
  duration: number;
  formatDuration: (seconds: number) => string;
}

export function CallStatus({ 
  status, 
  isOnline, 
  remoteName, 
  remotePhoto, 
  duration, 
  formatDuration 
}: CallStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case "ringing":
        return "Ringing...";
      case "calling":
        return isOnline ? "Calling..." : "User is offline";
      case "connected":
        return formatDuration(duration);
      case "rejected":
        return "Call Rejected";
      case "missed":
        return "Missed Call";
      case "ended":
        return "Call Ended";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "ringing":
        return "text-blue-500";
      case "calling":
        return isOnline ? "text-yellow-500" : "text-red-500";
      case "connected":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      case "missed":
        return "text-orange-500";
      case "ended":
        return "text-gray-500";
      default:
        return "text-muted-foreground";
    }
  };

  const showAvatar = ["ringing", "calling", "connected", "rejected", "missed"].includes(status);

  return (
    <div className="flex flex-col items-center justify-center">
      {showAvatar && (
        <div className={cn(
          "transition-all duration-300",
          status === "ringing" && "animate-pulse",
          status === "connected" && "ring-4 ring-green-500/20"
        )}>
          <Avatar
            name={remoteName}
            imageUrl={remotePhoto || undefined}
            size="xl"
          />
        </div>
      )}
      
      {showAvatar && (
        <h2 className="mt-6 text-2xl font-semibold text-foreground">
          {remoteName}
        </h2>
      )}
      
      <p className={cn(
        "mt-2 text-lg font-medium transition-colors duration-200",
        getStatusColor()
      )}>
        {getStatusText()}
      </p>
      
      {/* Online indicator for ringing/calling */}
      {(status === "ringing" || (status === "calling" && isOnline)) && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Online</span>
        </div>
      )}
      
      {/* Offline indicator */}
      {status === "calling" && !isOnline && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-sm text-muted-foreground">Offline</span>
        </div>
      )}
    </div>
  );
}
