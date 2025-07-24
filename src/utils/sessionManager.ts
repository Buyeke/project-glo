
import { supabase } from '@/integrations/supabase/client';

export class SessionManager {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes
  private static refreshTimer: NodeJS.Timeout | null = null;

  static startSessionMonitoring(): void {
    this.scheduleRefresh();
    this.checkSessionExpiry();
  }

  static stopSessionMonitoring(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private static scheduleRefresh(): void {
    this.refreshTimer = setInterval(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh failed:', error);
          await this.handleSessionExpiry();
        }
      } catch (error) {
        console.error('Session refresh error:', error);
        await this.handleSessionExpiry();
      }
    }, this.REFRESH_INTERVAL);
  }

  private static checkSessionExpiry(): void {
    const checkExpiry = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const expiresAt = new Date(session.expires_at! * 1000);
        const now = new Date();
        
        if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) { // 5 minutes before expiry
          await this.handleSessionExpiry();
        }
      }
    }, 60000); // Check every minute
  }

  private static async handleSessionExpiry(): Promise<void> {
    await supabase.auth.signOut();
    this.stopSessionMonitoring();
    
    // Clear any stored tokens
    sessionStorage.clear();
    localStorage.removeItem('supabase.auth.token');
    
    // Redirect to login
    window.location.href = '/auth';
  }
}
