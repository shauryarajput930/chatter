import { cn } from "@/lib/utils";
import { Clock, Check, CheckCheck } from "lucide-react";

export type MessageDeliveryStatus = "sending" | "sent" | "delivered" | "read";

interface MessageStatusProps {
  status: MessageDeliveryStatus;
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  const baseClasses = "w-3.5 h-3.5 flex-shrink-0";

  switch (status) {
    case "sending":
      return (
        <Clock
          className={cn(baseClasses, "text-muted-foreground animate-pulse", className)}
        />
      );
    case "sent":
      return (
        <Check
          className={cn(baseClasses, "text-muted-foreground", className)}
        />
      );
    case "delivered":
      return (
        <CheckCheck
          className={cn(baseClasses, "text-muted-foreground", className)}
        />
      );
    case "read":
      return (
        <CheckCheck
          className={cn(baseClasses, "text-primary", className)}
        />
      );
    default:
      return null;
  }
}
