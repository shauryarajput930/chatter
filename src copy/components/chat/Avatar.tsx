import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  showStatus?: boolean;
}

export function Avatar({ 
  name, 
  imageUrl, 
  size = "md", 
  online = false,
  showStatus = false 
}: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-24 h-24 text-2xl",
  };

  const statusSizeClasses = {
    sm: "w-2.5 h-2.5 border-[1.5px]",
    md: "w-3 h-3 border-2",
    lg: "w-3.5 h-3.5 border-2",
    xl: "w-4 h-4 border-2",
  };

  return (
    <div className="relative inline-block">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={cn(
            "rounded-full object-cover shadow-soft",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground shadow-soft",
            sizeClasses[size]
          )}
        >
          {initial}
        </div>
      )}
      
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-card",
            statusSizeClasses[size],
            online ? "bg-status-online online-pulse" : "bg-status-offline"
          )}
        />
      )}
    </div>
  );
}
