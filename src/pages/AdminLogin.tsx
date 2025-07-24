
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { logSecurityEvent, getClientIP } from '@/utils/securityLogger';
import { checkRateLimit } from '@/utils/rateLimiter';
import { validateFormData } from '@/utils/enhancedInputValidation';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      checkAdminAccessAndRedirect();
    }
  }, [user]);

  const checkAdminAccessAndRedirect = async () => {
    try {
      console.log('Checking admin access for user:', user?.email);
      
      // Add a small delay to ensure RLS policies are properly loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error } = await supabase.rpc('is_admin_user');
      
      if (error) {
        console.error('Error checking admin access:', error);
        await logSecurityEvent({
          event_type: 'admin_access',
          user_id: user?.id,
          event_data: { error: error.message, success: false },
          ip_address: await getClientIP()
        });
        toast.error('Error verifying admin access');
        return;
      }

      console.log('Admin check result:', data);

      if (data) {
        console.log('User is admin, redirecting to admin panel');
        await logSecurityEvent({
          event_type: 'admin_access',
          user_id: user?.id,
          event_data: { success: true },
          ip_address: await getClientIP()
        });
        navigate('/admin');
      } else {
        console.log('User is not admin, signing out');
        await logSecurityEvent({
          event_type: 'unauthorized_access',
          user_id: user?.id,
          event_data: { attempted_resource: 'admin_panel' },
          ip_address: await getClientIP()
        });
        toast.error('Access denied. Admin privileges required.');
        await supabase.auth.signOut();
        navigate('/');
      }
    } catch (error) {
      console.error('Error in admin check:', error);
      await logSecurityEvent({
        event_type: 'admin_access',
        user_id: user?.id,
        event_data: { error: String(error), success: false },
        ip_address: await getClientIP()
      });
      toast.error('Error verifying admin access');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form data
      const { isValid, errors: validationErrors } = validateFormData({ email, password });
      if (!isValid) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Check rate limit
      const ipAddress = await getClientIP();
      const rateLimitResult = await checkRateLimit(ipAddress, 'login_attempt');
      
      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitResult.resetTime;
        const resetTimeString = resetTime ? resetTime.toLocaleTimeString() : 'later';
        
        toast.error(`Too many login attempts. Please try again after ${resetTimeString}`);
        await logSecurityEvent({
          event_type: 'rate_limit_exceeded',
          event_data: { action: 'admin_login_attempt', email },
          ip_address: ipAddress
        });
        setLoading(false);
        return;
      }

      console.log('Attempting admin login for:', email);
      
      // Log login attempt
      await logSecurityEvent({
        event_type: 'login_attempt',
        event_data: { email, type: 'admin_login' },
        ip_address: ipAddress
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Admin login error:', error);
        
        // Log failed login
        await logSecurityEvent({
          event_type: 'login_failure',
          event_data: { email, error: error.message, type: 'admin_login' },
          ip_address: ipAddress
        });
        
        throw error;
      }

      if (data.user) {
        console.log('Admin login successful for user:', data.user.email);
        toast.success('Login successful, verifying admin access...');
        
        // Wait for auth state to update, then check admin status
        setTimeout(async () => {
          try {
            const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user');
            
            if (adminError) {
              console.error('Admin check error:', adminError);
              await logSecurityEvent({
                event_type: 'admin_access',
                user_id: data.user.id,
                event_data: { error: adminError.message, success: false },
                ip_address: ipAddress
              });
              toast.error('Error checking admin privileges');
              await supabase.auth.signOut();
              return;
            }

            console.log('Admin status:', isAdmin);

            if (isAdmin) {
              await logSecurityEvent({
                event_type: 'admin_access',
                user_id: data.user.id,
                event_data: { success: true },
                ip_address: ipAddress
              });
              toast.success('Admin access verified');
              navigate('/admin');
            } else {
              await logSecurityEvent({
                event_type: 'unauthorized_access',
                user_id: data.user.id,
                event_data: { attempted_resource: 'admin_panel' },
                ip_address: ipAddress
              });
              toast.error('Access denied. Admin privileges required.');
              await supabase.auth.signOut();
            }
          } catch (error) {
            console.error('Error in admin verification:', error);
            await logSecurityEvent({
              event_type: 'admin_access',
              user_id: data.user.id,
              event_data: { error: String(error), success: false },
              ip_address: ipAddress
            });
            toast.error('Error verifying admin privileges');
            await supabase.auth.signOut();
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Please confirm your email address before signing in');
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Access
          </CardTitle>
          <CardDescription>
            Restricted access for GLO administrators only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@glo.org"
                required
                disabled={loading}
                className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In as Admin
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Authorized Personnel Only
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  This portal is restricted to GLO administrators. Unauthorized access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
