
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, SecurityEventType, getClientIP } from './securityLogger';

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivities: number;
  rateLimitViolations: number;
  lastSecurityEvent: Date | null;
}

interface EnhancedSecurityEvent {
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  fingerprint?: string;
}

export class EnhancedSecurityMonitor {
  private static instance: EnhancedSecurityMonitor;
  private metrics: SecurityMetrics = {
    failedLoginAttempts: 0,
    suspiciousActivities: 0,
    rateLimitViolations: 0,
    lastSecurityEvent: null
  };

  static getInstance(): EnhancedSecurityMonitor {
    if (!EnhancedSecurityMonitor.instance) {
      EnhancedSecurityMonitor.instance = new EnhancedSecurityMonitor();
    }
    return EnhancedSecurityMonitor.instance;
  }

  async logEnhancedSecurityEvent(event: EnhancedSecurityEvent): Promise<void> {
    try {
      const clientIP = await getClientIP();
      
      // Log to existing security logger
      await logSecurityEvent({
        event_type: event.eventType,
        event_data: {
          severity: event.severity,
          details: event.details,
          fingerprint: event.fingerprint,
          timestamp: new Date().toISOString()
        },
        ip_address: clientIP,
        user_agent: navigator.userAgent
      });

      // Update local metrics
      this.updateMetrics(event.eventType);

      // Check for security patterns and escalate if needed
      await this.checkSecurityPatterns(event);

    } catch (error) {
      console.error('Failed to log enhanced security event:', error);
    }
  }

  private updateMetrics(eventType: SecurityEventType): void {
    switch (eventType) {
      case 'login_failure':
        this.metrics.failedLoginAttempts++;
        break;
      case 'suspicious_activity':
        this.metrics.suspiciousActivities++;
        break;
      case 'rate_limit_exceeded':
        this.metrics.rateLimitViolations++;
        break;
    }
    this.metrics.lastSecurityEvent = new Date();
  }

  private async checkSecurityPatterns(event: EnhancedSecurityEvent): Promise<void> {
    // Check for multiple failed login attempts
    if (event.eventType === 'login_failure' && this.metrics.failedLoginAttempts >= 5) {
      await this.logEnhancedSecurityEvent({
        eventType: 'suspicious_activity',
        severity: 'high',
        details: {
          pattern: 'multiple_failed_logins',
          count: this.metrics.failedLoginAttempts,
          timeWindow: '15 minutes'
        }
      });
    }

    // Check for rapid suspicious activities
    if (this.metrics.suspiciousActivities >= 3) {
      await this.logEnhancedSecurityEvent({
        eventType: 'suspicious_activity',
        severity: 'critical',
        details: {
          pattern: 'rapid_suspicious_activities',
          count: this.metrics.suspiciousActivities
        }
      });
    }
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    return { ...this.metrics };
  }

  async resetMetrics(): Promise<void> {
    this.metrics = {
      failedLoginAttempts: 0,
      suspiciousActivities: 0,
      rateLimitViolations: 0,
      lastSecurityEvent: null
    };
  }

  // Device fingerprinting for enhanced security
  generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(36);
  }
}

export const securityMonitor = EnhancedSecurityMonitor.getInstance();
