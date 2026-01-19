import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function OTPPasswordReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const passwordRequirements: PasswordRequirement[] = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "Contains a number", met: /\d/.test(newPassword) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "Passwords match", met: newPassword === confirmPassword && newPassword.length > 0 },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleOTPVerified = () => {
    setVerifiedEmail(email);
    setStep("reset");
    toast.success("Email verified! Now set your new password.");
  };

  const handleOTPCancel = () => {
    setEmail("");
    setStep("verify");
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      toast.error("Please meet all password requirements");
      return;
    }

    if (!verifiedEmail) {
      toast.error("Please verify your email first");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="neumorphic p-8">
            <OTPVerification
              email={email || ""}
              onVerified={handleOTPVerified}
              onCancel={handleOTPCancel}
              type="recovery"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="neumorphic p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Set New Password</h1>
            <p className="text-sm text-muted-foreground">
              Email verified: <strong>{verifiedEmail}</strong>
            </p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            {/* New Password Input */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Password must have:</p>
              {passwordRequirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      req.met
                        ? "bg-green-500/20 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {req.met ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="text-xs">•</span>
                    )}
                  </div>
                  <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Reset Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!allRequirementsMet || isLoading}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-center">
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
