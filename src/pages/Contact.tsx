
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit } from '@/utils/secureRateLimiter';
import { sanitizeInput, validateEmail, validateName, validateMessage } from '@/utils/secureInputValidation';
import { getClientIP, logSecurityEvent } from '@/utils/securityLogger';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate input
      if (!validateName(formData.name)) {
        toast.error('Please enter a valid name (2-100 characters)');
        return;
      }

      if (!validateEmail(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (!validateMessage(formData.message)) {
        toast.error('Message must be between 10-5000 characters');
        return;
      }

      // Check rate limit
      const clientIP = await getClientIP();
      const rateLimitResult = await checkRateLimit(
        `${formData.email}_${clientIP}`, 
        'contact_submission'
      );

      if (!rateLimitResult.allowed) {
        toast.error('Too many submissions. Please try again later.');
        await logSecurityEvent({
          event_type: 'rate_limit_exceeded',
          event_data: {
            action: 'contact_submission',
            email: formData.email,
            resetTime: rateLimitResult.resetTime
          },
          ip_address: clientIP
        });
        return;
      }

      // Submit form
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          submission_hash: btoa(`${formData.email}_${Date.now()}_${Math.random()}`)
        });

      if (error) {
        console.error('Contact submission error:', error);
        toast.error('Failed to submit message. Please try again.');
        return;
      }

      // Log successful submission
      await logSecurityEvent({
        event_type: 'contact_submission',
        event_data: {
          email: formData.email,
          subject: formData.subject
        },
        ip_address: clientIP
      });

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help. Reach out to us with any questions, concerns, or if you need immediate assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    maxLength={254}
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What is this about?"
                    maxLength={200}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    maxLength={5000}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.message.length}/5000 characters
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
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-red-600">Crisis Hotline</h4>
                    <p className="text-lg font-mono">+254 722 178 177</p>
                    <p className="text-sm text-gray-500">Available 24/7 for immediate support</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">Police Emergency</h4>
                    <p className="text-lg font-mono">999 or 112</p>
                    <p className="text-sm text-gray-500">For immediate danger situations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p>projectglo2024@gmail.com</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">Office Hours</h4>
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed (Emergency support available)</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Location</h4>
                    <p>Nairobi, Kenya</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Note</h4>
                    <p className="text-sm text-yellow-700">
                      If you're in immediate danger, please contact emergency services directly at 999 or 112. 
                      This contact form is not monitored 24/7.
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
