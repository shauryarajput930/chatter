import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { sendOTPForPasswordReset } from "@/lib/otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      if (useOTP) {
        // Send OTP for password reset
        const response = await sendOTPForPasswordReset(email);

        if (!response.success) {
          toast.error(response.error || response.message);
          setIsLoading(false);
          return;
        }

        setPendingEmail(email);
        setEmailSent(true);
        toast.success("Password reset code sent to your email");
      } else {
        // Use traditional email link
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        setEmailSent(true);
        toast.success("Password reset email sent");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setEmailSent(true);
    toast.success("Email verified. Redirecting to password reset...");
    // Navigate to reset password page
    setTimeout(() => {
      window.location.href = "/reset-password";
    }, 1500);
  };

  const handleOTPCancel = () => {
    setEmailSent(false);
    setPendingEmail("");
  };

  if (emailSent && useOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="neumorphic p-8">
            <OTPVerification
              email={pendingEmail}
              onVerified={handleOTPVerified}
              onCancel={handleOTPCancel}
              type="recovery"
            />
          </div>
        </div>
      </div>
    );
  }

  if (emailSent && !useOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="neumorphic p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to reset your password.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Try Another Email
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="neumorphic p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a code or link to reset your password.
            </p>
          </div>

          {/* Reset Method Toggle */}
          <div className="bg-muted/50 rounded-lg p-3 mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => setUseOTP(false)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                !useOTP
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Email Link
            </button>
            <button
              type="button"
              onClick={() => setUseOTP(true)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                useOTP
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              OTP Code
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : useOTP ? (
                "Send Reset Code"
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
