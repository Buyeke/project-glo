
// CSRF Protection utility
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const storeCSRFToken = (token: string): void => {
  sessionStorage.setItem('csrf_token', token);
};

export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken === token;
};

export const clearCSRFToken = (): void => {
  sessionStorage.removeItem('csrf_token');
};
