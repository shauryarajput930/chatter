import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SessionDebugger() {
  const { user, session, loading } = useAuth();

  const checkLocalStorage = () => {
    const sessionData = localStorage.getItem('supabase.auth.token');
    console.log('LocalStorage session data:', sessionData);
    
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        console.log('Parsed session:', {
          user: parsed.user?.email,
          expiresAt: new Date(parsed.expires_at * 1000),
          currentTime: new Date(),
          isValid: Date.now() < parsed.expires_at * 1000
        });
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
  };

  const clearSession = () => {
    localStorage.removeItem('supabase.auth.token');
    console.log('Session cleared from localStorage');
    window.location.reload();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-background border border-border rounded-lg shadow-lg max-w-sm">
      <h3 className="font-semibold mb-2">Session Debug</h3>
      <div className="space-y-1 text-xs">
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>User: {user?.email || 'Not logged in'}</p>
        <p>Session: {session ? 'Active' : 'None'}</p>
        <p>LocalStorage: {localStorage.getItem('supabase.auth.token') ? 'Present' : 'Empty'}</p>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={checkLocalStorage}>
          Check Storage
        </Button>
        <Button size="sm" variant="outline" onClick={clearSession}>
          Clear
        </Button>
      </div>
    </div>
  );
}
