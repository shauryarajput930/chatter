import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TwoFactorDisable() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDisable = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("totp-2fa/disable", {
        method: "POST",
        body: { code },
      });

      if (error) throw error;

      if (data.disabled) {
        toast.success("Two-factor authentication has been disabled");
        navigate("/settings");
      }
    } catch (error: any) {
      console.error("Disable error:", error);
      toast.error(error.message || "Failed to disable 2FA. Please check your code.");
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-lg font-semibold">Disable Two-Factor Authentication</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-card rounded-2xl shadow-soft p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <ShieldOff className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Confirm Disable 2FA</h2>
            <p className="text-muted-foreground">
              Enter a code from your authenticator app to confirm disabling two-factor authentication.
            </p>
          </div>

          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-sm text-destructive">
              Warning: Disabling 2FA will make your account less secure. Only proceed if you understand the risks.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
              }}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={6}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDisable}
                disabled={code.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Disable 2FA"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
