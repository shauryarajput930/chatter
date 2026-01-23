import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { validateUsername, generateUsernameFromName, formatUsername } from "@/utils/usernameUtils";

export function UsernameSettings() {
  const { profile } = useAuth();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    } else if (profile?.name) {
      const suggested = generateUsernameFromName(profile.name);
      setUsername(suggested);
    }
  }, [profile]);

  useEffect(() => {
    if (username) {
      const result = validateUsername(username);
      setValidation(result);
      
      if (result.isValid && username !== profile?.username) {
        checkAvailability();
      } else {
        setIsAvailable(null);
      }
    } else {
      setValidation(null);
      setIsAvailable(null);
    }
  }, [username, profile?.username]);

  const checkAvailability = async () => {
    if (!username || !validation?.isValid) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();

      setIsAvailable(error ? true : false); // If error, username doesn't exist (available)
    } catch (error) {
      console.error("Error checking username availability:", error);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!profile || !username || !validation?.isValid || isAvailable === false) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", profile.id);

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating username:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canSave = validation?.isValid && isAvailable !== false && username !== profile?.username;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Username Settings</CardTitle>
        <CardDescription>
          Set a unique username to make it easier for friends to find you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className={validation && !validation.isValid ? "border-red-500" : ""}
            />
            {isChecking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {validation?.isValid && isAvailable === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            )}
            {validation?.isValid && isAvailable === false && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          
          {validation && !validation.isValid && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{validation.error}</AlertDescription>
            </Alert>
          )}
          
          {validation?.isValid && isAvailable === false && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>This username is already taken</AlertDescription>
            </Alert>
          )}
          
          {validation?.isValid && isAvailable === true && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Username is available!</AlertDescription>
            </Alert>
          )}
        </div>

        {profile?.username && (
          <div className="text-sm text-muted-foreground">
            Current username: {formatUsername(profile.username)}
          </div>
        )}

        <Button 
          onClick={handleSaveUsername}
          disabled={!canSave || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Username"
          )}
        </Button>

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Username updated successfully!</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Username must be 3-20 characters long</p>
          <p>• Can only contain letters, numbers, and underscores</p>
          <p>• Cannot start or end with an underscore</p>
        </div>
      </CardContent>
    </Card>
  );
}
