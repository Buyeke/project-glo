
export const sanitizeInput = (input: string): string => {
  // Remove HTML tags and encode special characters
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100 && !/<[^>]*>/.test(name);
};

export const validateMessage = (message: string): boolean => {
  const trimmedMessage = message.trim();
  return trimmedMessage.length >= 10 && trimmedMessage.length <= 5000;
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const generateSubmissionHash = (name: string, email: string, message: string): string => {
  const content = `${name.toLowerCase().trim()}|${email.toLowerCase().trim()}|${message.trim()}`;
  return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
};
