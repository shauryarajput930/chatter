import { Phone, PhoneOff, Video } from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IncomingCallDialogProps {
  callerName: string;
  callerPhoto?: string | null;
  callType: "video" | "audio";
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallDialog({
  callerName,
  callerPhoto,
  callType,
  onAnswer,
  onDecline,
}: IncomingCallDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-3xl p-8 shadow-lg max-w-sm w-full mx-4 animate-scale-in">
        <div className="text-center space-y-6">
          {/* Caller Avatar with Pulse Animation */}
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: "1.5s" }} />
            <div className="relative">
              <Avatar
                name={callerName}
                imageUrl={callerPhoto || undefined}
                size="xl"
              />
            </div>
          </div>

          {/* Caller Info */}
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {callerName}
            </h2>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              {callType === "video" ? (
                <>
                  <Video className="w-4 h-4" />
                  Incoming video call...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Incoming voice call...
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-8">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-16 h-16 rounded-full",
                "bg-destructive text-destructive-foreground",
                "hover:bg-destructive/90 transition-all duration-200",
                "shadow-lg hover:shadow-xl"
              )}
              onClick={onDecline}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-16 h-16 rounded-full",
                "bg-green-500 text-white",
                "hover:bg-green-600 transition-all duration-200",
                "shadow-lg hover:shadow-xl animate-pulse"
              )}
              onClick={onAnswer}
            >
              {callType === "video" ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
