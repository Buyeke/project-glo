
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SessionManager } from '@/utils/sessionManager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const notificationSentRef = useRef<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Start session monitoring when user logs in
        if (session && event === 'SIGNED_IN') {
          SessionManager.startSessionMonitoring();
          
          // Send auth notification email only once per user session
          const userId = session.user?.id;
          if (userId && notificationSentRef.current !== userId) {
            notificationSentRef.current = userId;
            
            const isNewUser = session.user?.created_at && 
              (Date.now() - new Date(session.user.created_at).getTime()) < 60000;
            
            supabase.functions.invoke('auth-notification', {
              body: {
                event_type: isNewUser ? 'signup' : 'login',
                user_email: session.user?.email || 'unknown',
                user_id: userId,
                timestamp: new Date().toISOString(),
              }
            }).catch(err => console.error('Auth notification failed:', err));
          }
        } else if (event === 'SIGNED_OUT') {
          SessionManager.stopSessionMonitoring();
          notificationSentRef.current = null;
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Start session monitoring if user is already logged in
      if (session) {
        SessionManager.startSessionMonitoring();
      }
    });

    return () => {
      subscription.unsubscribe();
      SessionManager.stopSessionMonitoring();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    SessionManager.stopSessionMonitoring();
    
    // Clear all stored tokens and session data
    sessionStorage.clear();
    localStorage.removeItem('supabase.auth.token');
    
    await supabase.auth.signOut();
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
