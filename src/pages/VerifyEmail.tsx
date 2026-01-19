import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the hash from URL (Supabase sets this after email confirmation)
        const hash = window.location.hash;

        if (!hash) {
          setStatus("error");
          setMessage("No verification code found. Please check your email link.");
          return;
        }

        // Supabase handles the verification automatically when accessing this route
        // with the verification hash in the URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setMessage("Failed to verify email. Please try again.");
          return;
        }

        if (session) {
          setStatus("success");
          setMessage("Email verified successfully!");
          
          // Redirect to messages after 2 seconds
          setTimeout(() => {
            navigate("/messages");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Verification failed. Please try signing up again.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "An error occurred during verification.");
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="neumorphic p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Email</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <Button
                onClick={() => navigate("/messages")}
                className="w-full"
                size="lg"
              >
                Go to Messages
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/signup")}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
