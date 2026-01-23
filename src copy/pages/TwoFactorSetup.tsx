import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Shield,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    if (!authLoading && user && session) {
      initSetup();
    }
  }, [authLoading, user, session]);

  const initSetup = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("totp-2fa/setup", {
        method: "POST",
      });

      if (error) throw error;
      setSetupData(data);
    } catch (error: any) {
      console.error("Setup error:", error);
      toast.error("Failed to initialize 2FA setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("totp-2fa/verify", {
        method: "POST",
        body: { code: verificationCode },
      });

      if (error) throw error;

      if (data.valid && data.backupCodes) {
        setBackupCodes(data.backupCodes);
        setStep("backup");
        toast.success("2FA enabled successfully!");
      } else if (!data.valid) {
        toast.error("Invalid code. Please try again.");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "secret" | "backup") => {
    await navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
    toast.success("Copied to clipboard");
  };

  const handleComplete = () => {
    navigate("/settings");
  };

  if (authLoading) {
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
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Set Up Two-Factor Authentication</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["setup", "verify", "backup"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : ["setup", "verify", "backup"].indexOf(step) > i
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {["setup", "verify", "backup"].indexOf(step) > i ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 ${
                    ["setup", "verify", "backup"].indexOf(step) > i
                      ? "bg-green-500"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Setup */}
        {step === "setup" && (
          <div className="bg-card rounded-2xl shadow-soft p-6 space-y-6">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Scan QR Code</h2>
              <p className="text-muted-foreground">
                Use your authenticator app to scan this QR code
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : setupData ? (
              <>
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl">
                    <img
                      src={setupData.qrCodeUrl}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Or enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono text-center break-all">
                      {setupData.secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(setupData.secret, "secret")}
                    >
                      {copiedSecret ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button className="w-full" onClick={() => setStep("verify")}>
                  Continue
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Step 2: Verify */}
        {step === "verify" && (
          <div className="bg-card rounded-2xl shadow-soft p-6 space-y-6">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verify Code</h2>
              <p className="text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setVerificationCode(val);
                }}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("setup")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === "backup" && (
          <div className="bg-card rounded-2xl shadow-soft p-6 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Save Backup Codes</h2>
              <p className="text-muted-foreground">
                Store these codes in a safe place. You can use them to access your account if you lose your phone.
              </p>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Each code can only be used once. Keep them secure and don't share them with anyone.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="p-3 bg-muted rounded-lg text-sm font-mono text-center"
                >
                  {code}
                </code>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => copyToClipboard(backupCodes.join("\n"), "backup")}
            >
              {copiedBackup ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Codes
                </>
              )}
            </Button>

            <Button className="w-full" onClick={handleComplete}>
              Done
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
