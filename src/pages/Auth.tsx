import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Users, Building2, AlertTriangle } from 'lucide-react';
import { logSecurityEvent, getClientIP } from '@/utils/securityLogger';
import { checkRateLimit } from '@/utils/rateLimiter';
import { validateFormData, validatePasswordStrength, sanitizeHTML } from '@/utils/enhancedInputValidation';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState('individual');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Individual signup form
  const [individualForm, setIndividualForm] = useState({
    email: '',
    password: '',
    fullName: '',
    age: '',
    location: '',
    phone: '',
    needs: [] as string[],
  });

  // NGO signup form
  const [ngoForm, setNgoForm] = useState({
    email: '',
    password: '',
    fullName: '',
    organizationName: '',
    registrationNumber: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    description: '',
    servicesOffered: [] as string[],
    capacity: '',
  });

  const needsOptions = [
    'Shelter/Housing',
    'Food Assistance',
    'Healthcare',
    'Mental Health Support',
    'Job Training',
    'Childcare',
    'Legal Aid',
    'Education Support'
  ];

  const servicesOptions = [
    'Emergency Shelter',
    'Transitional Housing',
    'Mental Health Counseling',
    'Job Training',
    'Healthcare Services',
    'Legal Aid',
    'Childcare',
    'Food Programs',
    'Education Support',
    'Addiction Recovery'
  ];

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      const { isValid, errors: validationErrors } = validateFormData({
        email: individualForm.email,
        password: individualForm.password
      });
      
      if (!isValid) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      // Check rate limit
      const ipAddress = await getClientIP();
      const rateLimitResult = await checkRateLimit(ipAddress, 'login_attempt');
      
      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitResult.resetTime;
        const resetTimeString = resetTime ? resetTime.toLocaleTimeString() : 'later';
        
        toast({
          title: "Rate limit exceeded",
          description: `Too many login attempts. Please try again after ${resetTimeString}`,
          variant: "destructive",
        });
        
        await logSecurityEvent({
          event_type: 'rate_limit_exceeded',
          event_data: { action: 'login_attempt', email: individualForm.email },
          ip_address: ipAddress
        });
        
        setIsLoading(false);
        return;
      }

      // Log login attempt
      await logSecurityEvent({
        event_type: 'login_attempt',
        event_data: { email: individualForm.email },
        ip_address: ipAddress
      });

      const { error } = await supabase.auth.signInWithPassword({
        email: individualForm.email.trim(),
        password: individualForm.password,
      });

      if (error) {
        // Log failed login
        await logSecurityEvent({
          event_type: 'login_failure',
          event_data: { email: individualForm.email, error: error.message },
          ip_address: ipAddress
        });
        throw error;
      }

      // Log successful login
      await logSecurityEvent({
        event_type: 'login_success',
        event_data: { email: individualForm.email },
        ip_address: ipAddress
      });

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndividualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      console.log('Starting individual signup process...', { email: individualForm.email });
      
      // Validate form data
      const { isValid, errors: validationErrors } = validateFormData({
        email: individualForm.email,
        password: individualForm.password,
        fullName: individualForm.fullName,
        age: individualForm.age,
        location: individualForm.location
      });
      
      if (!isValid) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      // Validate password strength
      const { isValid: isPasswordValid, errors: passwordErrors } = validatePasswordStrength(individualForm.password);
      if (!isPasswordValid) {
        setErrors({ password: passwordErrors.join(', ') });
        setIsLoading(false);
        return;
      }

      // Sanitize inputs
      const sanitizedData = {
        email: individualForm.email.trim().toLowerCase(),
        password: individualForm.password,
        fullName: sanitizeHTML(individualForm.fullName.trim()),
        age: parseInt(individualForm.age),
        location: sanitizeHTML(individualForm.location.trim()),
        phone: sanitizeHTML(individualForm.phone.trim()),
        needs: individualForm.needs.map(need => sanitizeHTML(need))
      };

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: sanitizedData.fullName,
            user_type: 'individual',
            age: sanitizedData.age,
            location: sanitizedData.location,
            phone: sanitizedData.phone,
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) throw error;

      // Create user needs entries
      if (data.user && sanitizedData.needs.length > 0) {
        console.log('Creating user needs...', sanitizedData.needs);
        const needsPromises = sanitizedData.needs.map(need => 
          supabase.from('user_needs').insert({
            user_id: data.user.id,
            need_type: need,
            description: `Seeking support for ${need}`,
          })
        );
        await Promise.all(needsPromises);
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Individual signup error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNgoSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      console.log('Starting NGO signup process...', { email: ngoForm.email });
      
      // Validate form data
      const { isValid, errors: validationErrors } = validateFormData({
        email: ngoForm.email,
        password: ngoForm.password,
        fullName: ngoForm.fullName,
        organizationName: ngoForm.organizationName,
        location: ngoForm.location,
        description: ngoForm.description
      });
      
      if (!isValid) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      // Validate password strength
      const { isValid: isPasswordValid, errors: passwordErrors } = validatePasswordStrength(ngoForm.password);
      if (!isPasswordValid) {
        setErrors({ password: passwordErrors.join(', ') });
        setIsLoading(false);
        return;
      }

      // Sanitize inputs
      const sanitizedData = {
        email: ngoForm.email.trim().toLowerCase(),
        password: ngoForm.password,
        fullName: sanitizeHTML(ngoForm.fullName.trim()),
        organizationName: sanitizeHTML(ngoForm.organizationName.trim()),
        registrationNumber: sanitizeHTML(ngoForm.registrationNumber.trim()),
        location: sanitizeHTML(ngoForm.location.trim()),
        contactEmail: sanitizeHTML(ngoForm.contactEmail.trim()),
        contactPhone: sanitizeHTML(ngoForm.contactPhone.trim()),
        website: sanitizeHTML(ngoForm.website.trim()),
        description: sanitizeHTML(ngoForm.description.trim()),
        servicesOffered: ngoForm.servicesOffered.map(service => sanitizeHTML(service)),
        capacity: parseInt(ngoForm.capacity) || null
      };

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: sanitizedData.fullName,
            user_type: 'ngo',
            location: sanitizedData.location,
          }
        }
      });

      console.log('NGO signup response:', { data, error });

      if (error) throw error;

      // Create NGO details entry
      if (data.user) {
        console.log('Creating NGO details...', sanitizedData.organizationName);
        await supabase.from('ngo_details').insert({
          user_id: data.user.id,
          organization_name: sanitizedData.organizationName,
          registration_number: sanitizedData.registrationNumber,
          location: sanitizedData.location,
          contact_email: sanitizedData.contactEmail,
          contact_phone: sanitizedData.contactPhone,
          website: sanitizedData.website,
          description: sanitizedData.description,
          services_offered: sanitizedData.servicesOffered,
          capacity: sanitizedData.capacity,
        });
      }

      toast({
        title: "NGO account created!",
        description: "Your application is pending verification. You'll receive an email once approved.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('NGO signup error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNeedsChange = (need: string, checked: boolean) => {
    if (checked) {
      setIndividualForm(prev => ({ ...prev, needs: [...prev.needs, need] }));
    } else {
      setIndividualForm(prev => ({ ...prev, needs: prev.needs.filter(n => n !== need) }));
    }
  };

  const handleServicesChange = (service: string, checked: boolean) => {
    if (checked) {
      setNgoForm(prev => ({ ...prev, servicesOffered: [...prev.servicesOffered, service] }));
    } else {
      setNgoForm(prev => ({ ...prev, servicesOffered: prev.servicesOffered.filter(s => s !== service) }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Join Glo Community</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create your account to get started' : 'Welcome back to Glo'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>Sign In</TabsTrigger>
              <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={individualForm.email}
                    onChange={(e) => setIndividualForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={individualForm.password}
                    onChange={(e) => setIndividualForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">I am signing up as:</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Card 
                      className={`cursor-pointer transition-colors ${userType === 'individual' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setUserType('individual')}
                    >
                      <CardContent className="flex flex-col items-center p-4">
                        <Users className="h-8 w-8 text-primary mb-2" />
                        <span className="text-sm font-medium">Individual</span>
                        <span className="text-xs text-muted-foreground text-center">Seeking support & services</span>
                      </CardContent>
                    </Card>
                    <Card 
                      className={`cursor-pointer transition-colors ${userType === 'ngo' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setUserType('ngo')}
                    >
                      <CardContent className="flex flex-col items-center p-4">
                        <Building2 className="h-8 w-8 text-primary mb-2" />
                        <span className="text-sm font-medium">Organization</span>
                        <span className="text-xs text-muted-foreground text-center">Providing services & support</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {userType === 'individual' && (
                  <form onSubmit={handleIndividualSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={individualForm.fullName}
                          onChange={(e) => setIndividualForm(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                          className={errors.fullName ? 'border-red-500' : ''}
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={individualForm.age}
                          onChange={(e) => setIndividualForm(prev => ({ ...prev, age: e.target.value }))}
                          required
                          className={errors.age ? 'border-red-500' : ''}
                        />
                        {errors.age && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {errors.age}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={individualForm.email}
                        onChange={(e) => setIndividualForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={individualForm.password}
                        onChange={(e) => setIndividualForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {errors.password}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Password must be at least 8 characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={individualForm.location}
                          onChange={(e) => setIndividualForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, Country"
                          required
                          className={errors.location ? 'border-red-500' : ''}
                        />
                        {errors.location && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {errors.location}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          value={individualForm.phone}
                          onChange={(e) => setIndividualForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-medium">What support do you need? (Select all that apply)</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {needsOptions.map((need) => (
                          <div key={need} className="flex items-center space-x-2">
                            <Checkbox
                              id={need}
                              checked={individualForm.needs.includes(need)}
                              onCheckedChange={(checked) => handleNeedsChange(need, checked as boolean)}
                            />
                            <Label htmlFor={need} className="text-sm">{need}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Get Support Now'}
                    </Button>
                  </form>
                )}

                {userType === 'ngo' && (
                  <form onSubmit={handleNgoSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ngoFullName">Contact Person Name</Label>
                        <Input
                          id="ngoFullName"
                          value={ngoForm.fullName}
                          onChange={(e) => setNgoForm(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                          className={errors.fullName ? 'border-red-500' : ''}
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="organizationName">Organization Name</Label>
                        <Input
                          id="organizationName"
                          value={ngoForm.organizationName}
                          onChange={(e) => setNgoForm(prev => ({ ...prev, organizationName: e.target.value }))}
                          required
                          className={errors.organizationName ? 'border-red-500' : ''}
                        />
                        {errors.organizationName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {errors.organizationName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="ngoEmail">Email</Label>
                      <Input
                        id="ngoEmail"
                        type="email"
                        value={ngoForm.email}
                        onChange={(e) => setNgoForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="ngoPassword">Password</Label>
                      <Input
                        id="ngoPassword"
                        type="password"
                        value={ngoForm.password}
                        onChange={(e) => setNgoForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {errors.password}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Password must be at least 8 characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input
                          id="registrationNumber"
                          value={ngoForm.registrationNumber}
                          onChange={(e) => setNgoForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                          placeholder="Official registration #"
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity">Service Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={ngoForm.capacity}
                          onChange={(e) => setNgoForm(prev => ({ ...prev, capacity: e.target.value }))}
                          placeholder="Number of people you can serve"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ngoLocation">Location</Label>
                        <Input
                          id="ngoLocation"
                          value={ngoForm.location}
                          onChange={(e) => setNgoForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, Country"
                          required
                          className={errors.location ? 'border-red-500' : ''}
                        />
                        {errors.location && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {errors.location}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          value={ngoForm.contactPhone}
                          onChange={(e) => setNgoForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactEmail">Organization Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={ngoForm.contactEmail}
                          onChange={(e) => setNgoForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          value={ngoForm.website}
                          onChange={(e) => setNgoForm(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Organization Description</Label>
                      <Textarea
                        id="description"
                        value={ngoForm.description}
                        onChange={(e) => setNgoForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your organization and mission"
                        required
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-base font-medium">Services You Offer (Select all that apply)</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {servicesOptions.map((service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                              id={service}
                              checked={ngoForm.servicesOffered.includes(service)}
                              onCheckedChange={(checked) => handleServicesChange(service, checked as boolean)}
                            />
                            <Label htmlFor={service} className="text-sm">{service}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Submitting application...' : 'Join as NGO Partner'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Your application will be reviewed and you'll receive verification status via email.
                    </p>
                  </form>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
