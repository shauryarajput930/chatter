import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { sendOTPForVerification } from "@/lib/otp";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Send OTP for email verification
      const otpResponse = await sendOTPForVerification(email);
      
      if (!otpResponse.success) {
        toast.error(otpResponse.error || "Failed to send verification code");
        setIsLoading(false);
        return;
      }

      setPendingEmail(email);
      setRequiresOTP(true);
      toast.success("Verification code sent to your email");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    setIsLoading(true);
    try {
      // After OTP verification, complete the signup
      const { error } = await signUp(email, password, name);

      if (error) {
        toast.error(error.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      toast.success("Account created! Welcome to Chatter.");
      navigate("/messages");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPCancel = () => {
    setRequiresOTP(false);
    setPendingEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-neumorphic">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* OTP Verification */}
        {requiresOTP ? (
          <div className="neumorphic p-8">
            <OTPVerification
              email={pendingEmail}
              onVerified={handleOTPVerified}
              onCancel={handleOTPCancel}
              type="signup"
            />
          </div>
        ) : (
          <>
            {/* Welcome Card */}
            <div className="neumorphic p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
                <p className="text-muted-foreground">Join Chatter and start connecting</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>

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

                {/* Confirm Password Input */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>

                {/* Signup Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending verification code..." : "Create Account"}
                </Button>
              </form>
            </div>

            {/* Terms */}
            <p className="text-center mt-6 text-xs text-muted-foreground px-4">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>

            {/* Login Link */}
            <p className="text-center mt-4 text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
