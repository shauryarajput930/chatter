import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  username?: string;
  email: string | null;
  photo_url: string | null;
  bio: string | null;
  is_online: boolean;
  last_seen: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && !error) {
      setProfile(data);
    } else if (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Check localStorage first before setting up listeners
    const checkExistingSession = () => {
      try {
        const sessionData = localStorage.getItem('supabase.auth.token');
        console.log('Checking existing session in localStorage:', sessionData ? 'Found' : 'Not found');
        
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          const currentTime = Date.now();
          const expiryTime = parsed.expires_at * 1000;
          
          console.log('Session expiry time:', new Date(expiryTime));
          console.log('Current time:', new Date(currentTime));
          console.log('Session valid:', currentTime < expiryTime);
          
          if (currentTime >= expiryTime) {
            console.log('Session expired, clearing...');
            localStorage.removeItem('supabase.auth.token');
            return null;
          }
        }
        return sessionData;
      } catch (error) {
        console.error('Error checking existing session:', error);
        return null;
      }
    };
    
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Save session to localStorage manually for persistence
          try {
            localStorage.setItem('supabase.auth.token', JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user: session.user
            }));
            console.log('Session manually saved to localStorage');
          } catch (error) {
            console.error('Error saving session to localStorage:', error);
          }
          
          // Use setTimeout to avoid potential race conditions
          setTimeout(() => {
            if (mounted) fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          // Clear localStorage when session is null
          localStorage.removeItem('supabase.auth.token');
        }
        setLoading(false);
      }
    );

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        // First check if we have a valid session in localStorage
        const existingSession = checkExistingSession();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session from Supabase:', session?.user?.email);
          
          // If Supabase has no session but localStorage does, try to restore
          if (!session && existingSession) {
            console.log('Attempting to restore session from localStorage...');
            try {
              const parsed = JSON.parse(existingSession);
              // Try to refresh the session using the stored refresh token
              const { data: { session: refreshedSession }, error: refreshError } = 
                await supabase.auth.setSession({
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token
                });
              
              if (!refreshError && refreshedSession) {
                console.log('Session restored successfully:', refreshedSession.user?.email);
                setSession(refreshedSession);
                setUser(refreshedSession.user);
                await fetchProfile(refreshedSession.user.id);
              } else {
                console.log('Failed to restore session, clearing localStorage');
                localStorage.removeItem('supabase.auth.token');
              }
            } catch (restoreError) {
              console.error('Error restoring session:', restoreError);
              localStorage.removeItem('supabase.auth.token');
            }
          } else if (session) {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfile(session.user.id);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: name,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force clear local state even if signOut fails
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  // Add session refresh function
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signUp, signIn, signOut, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
