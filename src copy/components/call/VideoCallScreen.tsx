import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Phone,
} from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useRealTimeCall } from "@/hooks/useRealTimeCall";
import { CallStatus } from "@/components/call/CallStatus";

interface VideoCallScreenProps {
  roomName: string;
  remoteName: string;
  remotePhoto?: string | null;
  callType: "video" | "audio";
  calleeId: string;
  currentUserId: string;
  onEndCall: () => void;
  isIncoming?: boolean;
}

export function VideoCallScreen({
  roomName,
  remoteName,
  remotePhoto,
  callType,
  calleeId,
  currentUserId,
  onEndCall,
  isIncoming = false,
}: VideoCallScreenProps) {
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Real-time call management
  const {
    callState,
    startCall,
    acceptCall,
    rejectCall,
    endCall: endRealTimeCall,
    formatDuration,
  } = useRealTimeCall({ calleeId });
  
  // WebRTC for media
  const {
    isJoined,
    isConnected,
    localAudio,
    localVideo,
    error,
    toggleAudio,
    toggleVideo,
    endCall: endWebRTCall,
    setLocalVideoRef,
    setRemoteVideoRef,
    createOffer,
  } = useWebRTC({ 
    roomName, 
    callType, 
    onEndCall,
    currentUserId: currentUserId,
    targetUserId: calleeId 
  });
  
  // Initialize call based on whether it's incoming or outgoing
  useEffect(() => {
    if (isIncoming) {
      // Wait for user to accept/reject
    } else {
      // Start the call immediately for outgoing calls
      startCall();
    }
  }, [isIncoming, startCall]);

  // Set video refs
  useEffect(() => {
    setLocalVideoRef(localVideoRef.current);
    setRemoteVideoRef(remoteVideoRef.current);
  }, [setLocalVideoRef, setRemoteVideoRef]);
  
  // Handle end call
  const handleEndCall = () => {
    endRealTimeCall();
    endWebRTCall();
  };
  
  // Handle accept call
  const handleAcceptCall = () => {
    acceptCall();
    createOffer(); // Start WebRTC connection
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 relative bg-muted">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-20">
            <div className="text-center p-4">
              <p className="text-destructive font-medium">Connection Error</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {/* Call Status Overlay */}
        {callState.status !== "connected" && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <CallStatus
              status={callState.status}
              isOnline={callState.isOnline}
              remoteName={remoteName}
              remotePhoto={remotePhoto}
              duration={callState.duration}
              formatDuration={formatDuration}
            />
          </div>
        )}
        
        {callType === "video" && callState.status === "connected" && localVideo ? (
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
                  <p className="mt-4 text-muted-foreground">
                    {isJoined ? "Connecting..." : "Initializing..."}
                  </p>
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
          /* Audio Call or Not Connected */
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {callState.status !== "connected" ? (
              <CallStatus
                status={callState.status}
                isOnline={callState.isOnline}
                remoteName={remoteName}
                remotePhoto={remotePhoto}
                duration={callState.duration}
                formatDuration={formatDuration}
              />
            ) : (
              <>
                <Avatar
                  name={remoteName}
                  imageUrl={remotePhoto || undefined}
                  size="xl"
                />
                <h2 className="mt-6 text-2xl font-semibold text-foreground">
                  {remoteName}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {formatDuration(callState.duration)}
                </p>
              </>
            )}
          </div>
        )}

        {/* Call Info Overlay */}
        {callType === "video" && callState.status === "connected" && (
          <div className="absolute top-4 left-4 bg-background/50 backdrop-blur-sm rounded-xl px-4 py-2">
            <p className="text-sm font-medium">{remoteName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(callState.duration)}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-card border-t border-border p-6 safe-area-inset-bottom">
        <div className="flex justify-center gap-4">
          {/* Incoming Call Controls */}
          {isIncoming && callState.status === "ringing" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={rejectCall}
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 rounded-full bg-green-500 text-white hover:bg-green-600"
                onClick={handleAcceptCall}
              >
                <Phone className="w-8 h-8" />
              </Button>
            </>
          )}
          
          {/* In-Call Controls */}
          {(callState.status === "connected" || callState.status === "calling" || (!isIncoming && callState.status === "ringing")) && (
            <>
              {/* Mute Button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-14 h-14 rounded-full transition-all",
                  localAudio
                    ? "bg-muted/50 text-muted-foreground hover:bg-muted"
                    : "bg-muted text-foreground"
                )}
                onClick={toggleAudio}
              >
                {localAudio ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>

              {/* Video Toggle (only for video calls) */}
              {callType === "video" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-14 h-14 rounded-full transition-all",
                    localVideo
                      ? "bg-muted/50 text-muted-foreground hover:bg-muted"
                      : "bg-muted text-foreground"
                  )}
                  onClick={toggleVideo}
                >
                  {localVideo ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <VideoOff className="w-6 h-6" />
                  )}
                </Button>
              )}

              {/* End Call Button */}
              <Button
                variant="ghost"
                size="icon"
                className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleEndCall}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
