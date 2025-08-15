
import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from './enhancedSecurityMonitoring';

interface SessionConfig {
  maxIdleTime: number; // in milliseconds
  maxSessionTime: number; // in milliseconds
  requireReauth: boolean;
}

export class EnhancedSessionManager {
  private static instance: EnhancedSessionManager;
  private lastActivity: number = Date.now();
  private sessionStart: number = Date.now();
  private idleTimer: NodeJS.Timeout | null = null;
  private config: SessionConfig = {
    maxIdleTime: 30 * 60 * 1000, // 30 minutes
    maxSessionTime: 8 * 60 * 60 * 1000, // 8 hours
    requireReauth: false
  };

  static getInstance(): EnhancedSessionManager {
    if (!EnhancedSessionManager.instance) {
      EnhancedSessionManager.instance = new EnhancedSessionManager();
    }
    return EnhancedSessionManager.instance;
  }

  initialize(config?: Partial<SessionConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupActivityListeners();
    this.startIdleTimer();
    
    // Check session validity on page load
    this.checkSessionValidity();
  }

  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity();
      }, { passive: true });
    });
  }

  private updateActivity(): void {
    this.lastActivity = Date.now();
    this.resetIdleTimer();
  }

  private startIdleTimer(): void {
    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.config.maxIdleTime);
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.startIdleTimer();
  }

  private async handleIdleTimeout(): Promise<void> {
    await securityMonitor.logEnhancedSecurityEvent({
      eventType: 'suspicious_activity',
      severity: 'low',
      details: {
        reason: 'session_idle_timeout',
        idleTime: Date.now() - this.lastActivity
      }
    });

    // Sign out user due to inactivity
    await this.signOutUser('idle_timeout');
  }

  private async checkSessionValidity(): Promise<void> {
    const sessionAge = Date.now() - this.sessionStart;
    
    if (sessionAge > this.config.maxSessionTime) {
      await securityMonitor.logEnhancedSecurityEvent({
        eventType: 'suspicious_activity',
        severity: 'medium',
        details: {
          reason: 'session_max_time_exceeded',
          sessionAge: sessionAge
        }
      });

      await this.signOutUser('max_time_exceeded');
    }
  }

  private async signOutUser(reason: string): Promise<void> {
    try {
      await supabase.auth.signOut();
      
      // Redirect to login page with reason
      window.location.href = `/auth?reason=${reason}`;
    } catch (error) {
      console.error('Error signing out user:', error);
    }
  }

  async extendSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Failed to extend session:', error);
        return false;
      }

      this.sessionStart = Date.now();
      this.updateActivity();
      
      await securityMonitor.logEnhancedSecurityEvent({
        eventType: 'login_success',
        severity: 'low',
        details: {
          action: 'session_extended'
        }
      });

      return true;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  }

  getSessionInfo(): {
    timeRemaining: number;
    idleTime: number;
    sessionAge: number;
  } {
    const now = Date.now();
    return {
      timeRemaining: this.config.maxSessionTime - (now - this.sessionStart),
      idleTime: now - this.lastActivity,
      sessionAge: now - this.sessionStart
    };
  }

  destroy(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    
    // Remove event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.updateActivity);
    });
  }
}

export const sessionManager = EnhancedSessionManager.getInstance();
