
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Users, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, validateEmail, validateName, validateMessage, generateSubmissionHash } from '@/utils/inputValidation';
import { checkRateLimit } from '@/utils/rateLimiter';
import { logSecurityEvent, getClientIP } from '@/utils/securityLogger';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateName(formData.name)) {
      newErrors.name = 'Name must be 2-100 characters and contain no HTML tags';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateMessage(formData.message)) {
      newErrors.message = 'Message must be 10-5000 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get client IP for rate limiting and security logging
      const ipAddress = await getClientIP();
      
      // Check rate limit
      const rateLimitResult = await checkRateLimit(ipAddress, 'contact_submission');
      
      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitResult.resetTime;
        const resetTimeString = resetTime ? resetTime.toLocaleTimeString() : 'later';
        
        toast({
          title: "Rate limit exceeded",
          description: `Please try again after ${resetTimeString}`,
          variant: "destructive",
        });

        // Log rate limit exceeded event
        await logSecurityEvent({
          event_type: 'rate_limit_exceeded',
          event_data: { action: 'contact_submission' },
          ip_address: ipAddress
        });

        return;
      }

      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeInput(formData.name.trim()),
        email: sanitizeInput(formData.email.trim().toLowerCase()),
        message: sanitizeInput(formData.message.trim())
      };

      // Generate submission hash for duplicate detection
      const submissionHash = generateSubmissionHash(
        sanitizedData.name,
        sanitizedData.email,
        sanitizedData.message
      );

      // Check for duplicate submission
      const { data: existingSubmission } = await supabase
        .from('contact_submissions')
        .select('id')
        .eq('submission_hash', submissionHash)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .single();

      if (existingSubmission) {
        toast({
          title: "Duplicate submission detected",
          description: "You have already submitted this message recently.",
          variant: "destructive",
        });
        return;
      }

      // Store contact submission in database
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: sanitizedData.name,
          email: sanitizedData.email,
          message: sanitizedData.message,
          submission_hash: submissionHash,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          rate_limit_passed: true
        });

      if (error) {
        console.error('Contact submission error:', error);
        
        // Log security event for failed submission
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          event_data: { 
            action: 'contact_submission_failed',
            error: error.message 
          },
          ip_address: ipAddress
        });

        throw error;
      }

      // Log successful contact submission
      await logSecurityEvent({
        event_type: 'contact_submission',
        event_data: { 
          name: sanitizedData.name,
          email: sanitizedData.email
        },
        ip_address: ipAddress
      });

      // Show success message
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. We'll get back to you soon.",
      });

      // Reset form
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our team. We're here to help and answer any questions you may have.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Send us a message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
                All submissions are validated and protected against spam.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Your full name"
                    maxLength={100}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="your.email@example.com"
                    maxLength={254}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                    placeholder="Tell us how we can help..."
                    rows={5}
                    maxLength={5000}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.message && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {errors.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground ml-auto">
                      {formData.message.length}/5000
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Reach out to us directly through any of these channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">General Inquiries</p>
                    <p className="text-muted-foreground">info@projectglo.org</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Partnerships & Grants</p>
                    <p className="text-muted-foreground">founder@projectglo.org</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      For partnership or grant-related matters only
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">
                      123 Community Street<br />
                      Support City, SC 12345
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-muted-foreground">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-muted-foreground">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Security Notice</p>
                    <p className="text-sm text-yellow-700">
                      All submissions are protected by rate limiting and spam detection. 
                      We take your privacy and security seriously.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
