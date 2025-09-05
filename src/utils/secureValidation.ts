// Consolidated secure input validation utilities

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .slice(0, 1000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && 
         email.length <= 254 && 
         email.length >= 5 &&
         !/<script|javascript:|on\w+=/gi.test(email);
};

export const validateName = (name: string): boolean => {
  return name.length >= 2 && 
         name.length <= 100 && 
         !/[<>]/g.test(name) &&
         !/^\s+$/.test(name) && // Not just whitespace
         /^[a-zA-Z\s\-']+$/.test(name); // Only letters, spaces, hyphens, apostrophes
};

export const validateMessage = (message: string): boolean => {
  return message.length >= 10 && 
         message.length <= 5000 &&
         !/^\s+$/.test(message) && // Not just whitespace
         !/<script|javascript:|on\w+=/gi.test(message); // No script injections
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone) && 
         cleanPhone.length >= 7 && 
         cleanPhone.length <= 15;
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export const validateFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

export const generateSubmissionHash = (name: string, email: string, message: string): string => {
  const content = `${name.toLowerCase().trim()}|${email.toLowerCase().trim()}|${message.trim()}`;
  return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
};

// Rate limiting validation
export const validateRateLimitIdentifier = (identifier: string): boolean => {
  return identifier.length >= 3 && 
         identifier.length <= 254 &&
         !/[<>]/g.test(identifier);
};

// Password validation
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// XSS prevention
export const preventXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script.*?>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /<iframe.*?>/gi,
    /<embed.*?>/gi,
    /<object.*?>/gi
  ];
  
  return !xssPatterns.some(pattern => pattern.test(input));
};