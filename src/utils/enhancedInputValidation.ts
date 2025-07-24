
import { sanitizeInput, validateEmail, validateName, validateMessage } from './inputValidation';

// Enhanced XSS protection
export const sanitizeHTML = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\(/g, '&#40;')
    .replace(/\)/g, '&#41;')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/onload/gi, '')
    .replace(/onerror/gi, '')
    .replace(/onclick/gi, '')
    .replace(/onmouseover/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '');
};

// Enhanced form validation
export const validateFormData = (data: Record<string, any>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  // Check for required fields
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim().length === 0) {
      errors[key] = `${key} is required`;
      isValid = false;
    }
  });

  // Validate email if present
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
    isValid = false;
  }

  // Validate name if present
  if (data.name && !validateName(data.name)) {
    errors.name = 'Name must be 2-100 characters and contain no HTML tags';
    isValid = false;
  }

  // Check for potential XSS attacks
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' && value !== sanitizeHTML(value)) {
      errors[key] = `${key} contains potentially harmful content`;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Password strength validation
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { isValid: errors.length === 0, errors };
};

// Username validation
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username) && !/<[^>]*>/.test(username);
};
