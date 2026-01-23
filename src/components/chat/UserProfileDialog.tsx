import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  username?: string;
  email?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserProfileDialog({ open, onOpenChange, userId }: UserProfileDialogProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchProfile();
    }
  }, [open, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar 
                name={profile.name} 
                imageUrl={profile.photo_url} 
                size="xl" 
              />
              
              <div>
                <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                {profile.username && (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Bio</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground italic">No bio available</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
