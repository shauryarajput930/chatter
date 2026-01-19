import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Mail, Loader2 } from "lucide-react";
import { verifyOTPToken, resendOTP } from "@/lib/otp";
import { toast } from "sonner";

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
  type?: "signup" | "recovery";
}

export function OTPVerification({ email, onVerified, onCancel, type = "signup" }: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTPToken(email, otp, type === "signup" ? "signup" : "recovery");

      if (!response.success) {
        toast.error(response.error || response.message);
        setIsLoading(false);
        return;
      }

      toast.success(response.message);
      onVerified();
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      const response = await resendOTP(email, type);

      if (!response.success) {
        toast.error(response.error || response.message);
        setIsResending(false);
        return;
      }

      toast.success(response.message);
      setTimeLeft(60);
      setCanResend(false);
      setOtp("");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Verify Your Email</h2>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit code to <br />
          <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {/* OTP Input */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Enter Code
          </label>
          <Input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono"
            autoFocus
            required
          />
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </form>

      {/* Resend OTP */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">
          {canResend ? "Didn't receive the code?" : "Resend code in:"}
          {!canResend && (
            <span className="inline-flex items-center gap-1 ml-2 font-semibold text-primary">
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </span>
          )}
        </p>

        {canResend && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Code"
            )}
          </Button>
        )}
      </div>

      {/* Cancel Button */}
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onCancel}
        disabled={isLoading || isResending}
      >
        Cancel
      </Button>
    </div>
  );
}
