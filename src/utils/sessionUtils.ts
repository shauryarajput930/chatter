import { supabase } from "@/integrations/supabase/client";

export const checkSessionPersistence = () => {
  try {
    const sessionData = localStorage.getItem('supabase.auth.token');
    console.log('Session data in localStorage:', sessionData ? 'Present' : 'Missing');
    
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      console.log('Session expires at:', new Date(parsed.expires_at * 1000));
      console.log('Current time:', new Date());
      console.log('Time until expiry:', parsed.expires_at * 1000 - Date.now());
    }
    
    return !!sessionData;
  } catch (error) {
    console.error('Error checking session persistence:', error);
    return false;
  }
};

export const clearAllAuthData = () => {
  try {
    // Clear Supabase auth data
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    
    // Clear any other auth-related data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All auth data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const monitorSessionHealth = () => {
  setInterval(() => {
    const sessionData = localStorage.getItem('supabase.auth.token');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        const timeUntilExpiry = parsed.expires_at * 1000 - Date.now();
        
        // If session expires in less than 5 minutes, try to refresh
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('Session expiring soon, attempting refresh...');
          supabase.auth.refreshSession();
        }
      } catch (error) {
        console.error('Error monitoring session health:', error);
      }
    }
  }, 60000); // Check every minute
};
