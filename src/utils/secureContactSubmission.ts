
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit } from './secureRateLimiter';
import { logSecurityEvent } from './securityLogger';
import { validateEmail, validateName, validateMessage, sanitizeInput } from './secureInputValidation';

interface ContactSubmissionData {
  name: string;
  email: string;
  message: string;
  phone?: string;
}

interface SubmissionResult {
  success: boolean;
  message: string;
  error?: string;
}

export const submitContactForm = async (data: ContactSubmissionData): Promise<SubmissionResult> => {
  try {
    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      message: sanitizeInput(data.message),
      phone: data.phone ? sanitizeInput(data.phone) : undefined
    };

    // Validate inputs
    if (!validateName(sanitizedData.name)) {
      return { success: false, message: 'Please enter a valid name (2-100 characters).' };
    }

    if (!validateEmail(sanitizedData.email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (!validateMessage(sanitizedData.message)) {
      return { success: false, message: 'Please enter a message (10-5000 characters).' };
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(sanitizedData.email, 'contact_submission');
    
    if (!rateLimitResult.allowed) {
      await logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        event_data: {
          action: 'contact_submission',
          email: sanitizedData.email,
          reason: rateLimitResult.reason
        }
      });

      return { 
        success: false, 
        message: rateLimitResult.message || 'Too many submission attempts. Please wait before trying again.'
      };
    }

    // Create submission hash for duplicate detection
    const submissionData = `${sanitizedData.name}:${sanitizedData.email}:${sanitizedData.message}`;
    const submissionHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(submissionData));
    const hashArray = Array.from(new Uint8Array(submissionHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check for duplicate submission
    const { data: isDuplicate } = await supabase.rpc('check_duplicate_submission', {
      p_submission_hash: hashHex
    });

    if (isDuplicate) {
      return { 
        success: false, 
        message: 'This submission was already sent recently. Please wait before submitting again.'
      };
    }

    // Insert contact submission
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        message: sanitizedData.message,
        phone: sanitizedData.phone,
        submission_hash: hashHex,
        status: 'pending'
      });

    if (insertError) {
      console.error('Contact submission error:', insertError);
      
      await logSecurityEvent({
        event_type: 'contact_submission',
        event_data: {
          error: insertError.message,
          email: sanitizedData.email
        }
      });

      return { 
        success: false, 
        message: 'Failed to submit your message. Please try again.'
      };
    }

    // Log successful submission
    await logSecurityEvent({
      event_type: 'contact_submission',
      event_data: {
        email: sanitizedData.email,
        name_length: sanitizedData.name.length,
        message_length: sanitizedData.message.length
      }
    });

    return { 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you soon.'
    };

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    await logSecurityEvent({
      event_type: 'contact_submission',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email
      }
    });

    return { 
      success: false, 
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};
