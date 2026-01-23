import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCallHistory, CallHistoryItem } from "@/hooks/useCallHistory";
import { useVideoCalls } from "@/hooks/useVideoCalls";
import { Avatar } from "@/components/chat/Avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

export default function CallHistory() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { calls, loading: callsLoading, getFilteredCalls } = useCallHistory();
  const { startCall } = useVideoCalls();
  const [filter, setFilter] = useState<"all" | "missed" | "incoming" | "outgoing">("all");

  const filteredCalls = getFilteredCalls(filter);

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getCallIcon = (call: CallHistoryItem) => {
    if (call.status === "declined" || call.status === "missed" || call.status === "ringing") {
      return <PhoneMissed className="w-4 h-4 text-destructive" />;
    }
    if (call.direction === "incoming") {
      return <PhoneIncoming className="w-4 h-4 text-green-500" />;
    }
    return <PhoneOutgoing className="w-4 h-4 text-primary" />;
  };

  const getCallStatus = (call: CallHistoryItem): string => {
    if (call.status === "declined") return "Declined";
    if (call.status === "missed" || call.status === "ringing") return "Missed";
    if (call.status === "answered" || call.status === "ended") {
      return call.duration ? formatDuration(call.duration) : "Answered";
    }
    return call.status;
  };

  const getContactProfile = (call: CallHistoryItem) => {
    return call.direction === "outgoing" ? call.callee : call.caller;
  };

  const handleCallAgain = async (call: CallHistoryItem) => {
    const contact = getContactProfile(call);
    if (contact) {
      await startCall(contact.id, call.call_type as "video" | "audio");
    }
  };

  if (authLoading || callsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Call History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Calls List */}
        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
          {filteredCalls.length === 0 ? (
            <div className="p-8 text-center">
              <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No calls found</p>
            </div>
          ) : (
            filteredCalls.map((call, index) => {
              const contact = getContactProfile(call);
              return (
                <div
                  key={call.id}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <Avatar
                    name={contact?.name || "Unknown"}
                    imageUrl={contact?.photo_url || undefined}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{contact?.name || "Unknown"}</p>
                      {call.call_type === "video" ? (
                        <Video className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getCallIcon(call)}
                      <span>{getCallStatus(call)}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCallAgain(call)}
                    className="h-10 w-10 rounded-full text-primary hover:bg-primary/10"
                  >
                    {call.call_type === "video" ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <Phone className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
