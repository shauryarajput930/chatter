import { ChevronRight } from "lucide-react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  name: string;
  memberCount: number;
  createdAt: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function GroupCard({ 
  name, 
  memberCount, 
  createdAt, 
  onClick,
  isActive = false 
}: GroupCardProps) {
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
      <Avatar name={name} size="lg" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        <p className="text-sm text-muted-foreground">
          {memberCount} member{memberCount !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Created {createdAt}
        </p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
