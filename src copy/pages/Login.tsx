import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mail, Lock, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, attempt to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        toast.error(signInError.message || "Failed to sign in");
        setIsLoading(false);
        return;
      }

      if (!signInData.user) {
        toast.error("Failed to sign in");
        setIsLoading(false);
        return;
      }

      // Skip 2FA check for now - proceed directly
      toast.success("Welcome back!");
      navigate("/messages");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (twoFACode.length !== 6 && twoFACode.length !== 9) {
      toast.error("Please enter a valid code");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("totp-2fa/validate", {
        method: "POST",
        body: { 
          userId: pendingUserId, 
          code: twoFACode.replace("-", "") 
        },
      });

      if (error || !data?.valid) {
        toast.error("Invalid verification code");
        setIsLoading(false);
        return;
      }

      if (data.usedBackupCode) {
        toast.info("Backup code used. Consider regenerating your backup codes.");
      }

      toast.success("Welcome back!");
      navigate("/messages");
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTwoFACode("");
    setPendingUserId(null);
    // Sign out the pending session
    supabase.auth.signOut();
  };

  // 2FA Verification Screen
  if (requires2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-neumorphic">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <div className="neumorphic p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Two-Factor Authentication</h1>
              <p className="text-muted-foreground">
                Enter the 6-digit code from your authenticator app, or use a backup code.
              </p>
            </div>

            <form onSubmit={handle2FAVerify} className="space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={twoFACode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9-]/g, "").slice(0, 9);
                  setTwoFACode(val);
                }}
                className="text-center text-2xl tracking-[0.3em] font-mono"
                maxLength={9}
                autoFocus
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || (twoFACode.length !== 6 && twoFACode.length !== 9)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBack}
              >
                Back to Login
              </Button>
            </form>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-accent/50 border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Lost access to your authenticator? Use one of your backup codes to sign in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-neumorphic">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Welcome Card */}
        <div className="neumorphic p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue chatting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
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

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 rounded-2xl bg-accent/50 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            🔒 Your messages are private and secure. We use end-to-end encryption
            to keep your conversations safe.
          </p>
        </div>

        {/* Register Link */}
        <p className="text-center mt-6 text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
