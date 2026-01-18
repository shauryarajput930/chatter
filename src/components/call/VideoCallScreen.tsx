import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoCallScreenProps {
  roomName: string;
  remoteName: string;
  remotePhoto?: string | null;
  callType: "video" | "audio";
  onEndCall: () => void;
}

export function VideoCallScreen({
  roomName,
  remoteName,
  remotePhoto,
  callType,
  onEndCall,
}: VideoCallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get local media stream
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callType === "video",
          audio: true,
        });
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current && callType === "video") {
          localVideoRef.current.srcObject = stream;
        }
        
        // Simulate connection after 2 seconds (in real app, use Daily.co)
        setTimeout(() => {
          setIsConnected(true);
        }, 2000);
      } catch (error) {
        console.error("Failed to get media:", error);
      }
    };

    initMedia();

    return () => {
      // Cleanup media stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callType]);

  // Call duration timer
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 relative bg-muted">
        {callType === "video" && !isVideoOff ? (
          <>
            {/* Remote Video (Full Screen) */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isConnected ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Avatar
                    name={remoteName}
                    imageUrl={remotePhoto || undefined}
                    size="xl"
                  />
                  <p className="mt-4 text-muted-foreground">Connecting...</p>
                </div>
              )}
            </div>

            {/* Local Video (Picture in Picture) */}
            <div className="absolute top-4 right-4 w-32 h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-background">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </>
        ) : (
          /* Audio Call or Video Off View */
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Avatar
              name={remoteName}
              imageUrl={remotePhoto || undefined}
              size="xl"
            />
            <h2 className="mt-6 text-2xl font-semibold text-foreground">
              {remoteName}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isConnected ? formatDuration(callDuration) : "Connecting..."}
            </p>
          </div>
        )}

        {/* Call Info Overlay */}
        {callType === "video" && isConnected && (
          <div className="absolute top-4 left-4 bg-background/50 backdrop-blur-sm rounded-xl px-4 py-2">
            <p className="text-sm font-medium">{remoteName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(callDuration)}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-card border-t border-border p-6 safe-area-inset-bottom">
        <div className="flex justify-center gap-4">
          {/* Mute Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full transition-all",
              isMuted
                ? "bg-muted text-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
            onClick={toggleMute}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {/* Video Toggle (only for video calls) */}
          {callType === "video" && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-14 h-14 rounded-full transition-all",
                isVideoOff
                  ? "bg-muted text-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              onClick={toggleVideo}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </Button>
          )}

          {/* End Call Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onEndCall}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {/* Speaker Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full transition-all",
              isSpeakerMuted
                ? "bg-muted text-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
          >
            {isSpeakerMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
