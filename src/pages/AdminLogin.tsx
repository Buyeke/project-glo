
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, AlertTriangle } from 'lucide-react';
import { logSecurityEvent, getClientIP } from '@/utils/securityLogger';
import { checkRateLimit } from '@/utils/rateLimiter';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/reset`
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success('Reset email sent! Check your email for a password reset link.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ipAddress = await getClientIP();
      const rateLimitResult = await checkRateLimit(ipAddress, 'admin_login_attempt');
      
      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitResult.resetTime;
        const resetTimeString = resetTime ? resetTime.toLocaleTimeString() : 'later';
        
        toast.error(`Too many login attempts. Please try again after ${resetTimeString}`);
        
        await logSecurityEvent({
          event_type: 'rate_limit_exceeded',
          event_data: { action: 'admin_login', email },
          ip_address: ipAddress
        });
        
        setIsLoading(false);
        return;
      }

      await logSecurityEvent({
        event_type: 'admin_login_attempt',
        event_data: { email },
        ip_address: ipAddress
      });

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        await logSecurityEvent({
          event_type: 'admin_login_failure',
          event_data: { email, error: error.message },
          ip_address: ipAddress
        });
        throw error;
      }

      await logSecurityEvent({
        event_type: 'admin_login_success',
        event_data: { email },
        ip_address: ipAddress
      });

      toast.success('Welcome to the admin panel!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Admin Password</CardTitle>
            <CardDescription>
              {resetEmailSent ? 
                'Check your email for a reset link' : 
                'Enter your admin email to receive a password reset link'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetEmailSent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We've sent a password reset link to {forgotPasswordEmail}. 
                  Click the link in your email to reset your password.
                </p>
                <Button 
                  onClick={() => setShowForgotPassword(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Back to Admin Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail">Admin Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your admin email address"
                    required
                  />
                </div>
                <Button 
                  onClick={handleForgotPassword} 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button 
                  onClick={() => setShowForgotPassword(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Back to Admin Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Access the administrative dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@projectglo.org"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-sm text-blue-600 hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                This is a restricted area. Only authorized administrators can access this panel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
