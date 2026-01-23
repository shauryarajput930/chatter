import { cn } from "@/lib/utils";
import { Clock, Check, CheckCheck } from "lucide-react";

export type MessageDeliveryStatus = "sending" | "sent" | "delivered" | "read";

interface MessageStatusProps {
  status: MessageDeliveryStatus;
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  const baseClasses = "w-4 h-4 flex-shrink-0";

  switch (status) {
    case "sending":
      return (
        <div className={cn("flex items-center justify-center", className)}>
          <Clock
            className={cn(baseClasses, "text-muted-foreground animate-spin")}
            strokeWidth={2.5}
          />
        </div>
      );
    case "sent":
      return (
        <Check
          className={cn(baseClasses, "text-muted-foreground", className)}
          strokeWidth={2.5}
        />
      );
    case "delivered":
      return (
        <CheckCheck
          className={cn(baseClasses, "text-gray-400 dark:text-gray-500", className)}
          strokeWidth={2.5}
        />
      );
    case "read":
      return (
        <CheckCheck
          className={cn(baseClasses, "text-green-500 dark:text-green-400", className)}
          strokeWidth={2.5}
        />
      );
    default:
      return null;
  }
}
