
// Secure input validation utilities with enhanced protection
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254 && email.length >= 5;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7 && cleanPhone.length <= 15;
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

// Rate limiting validation
export const validateRateLimitIdentifier = (identifier: string): boolean => {
  return identifier.length >= 3 && 
         identifier.length <= 254 &&
         !/[<>]/g.test(identifier);
};
