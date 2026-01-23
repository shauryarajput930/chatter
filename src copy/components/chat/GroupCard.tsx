import { ChevronRight, Users, Hash } from "lucide-react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  name: string;
  memberCount: number;
  createdAt: string;
  onClick?: () => void;
  isActive?: boolean;
  isGroup?: boolean; // Add this prop to distinguish between groups and direct messages
}

export function GroupCard({ 
  name, 
  memberCount, 
  createdAt, 
  onClick,
  isActive = false,
  isGroup = true // Default to true for groups
}: GroupCardProps) {
  console.log("GroupCard render:", { name, isGroup, memberCount });
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 card-hover text-left",
        isActive 
          ? "bg-accent shadow-soft" 
          : "bg-card shadow-neumorphic hover:bg-accent/50"
      )}
    >
      {/* Group Icon or Avatar */}
      <div className="relative">
        {isGroup ? (
          // Group Icon Background - Simplified
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xl font-bold">👥</span>
          </div>
        ) : (
          // Direct Message Avatar
          <Avatar name={name} size="lg" />
        )}
        
        {/* Online indicator for groups with active members */}
        {isGroup && memberCount > 0 && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          {isGroup && (
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                GROUP
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          {isGroup ? (
            <>
              <span>👥</span>
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              <span>#</span>
              Direct Message
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Created {createdAt}
        </p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
