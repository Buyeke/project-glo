
import React, { useEffect, useState } from 'react';
import { generateCSRFToken, storeCSRFToken, getCSRFToken } from '@/utils/csrfProtection';

interface CSRFProtectedFormProps {
  children: React.ReactNode;
  onSubmit: (data: FormData, csrfToken: string) => void;
  className?: string;
}

const CSRFProtectedForm: React.FC<CSRFProtectedFormProps> = ({ children, onSubmit, className }) => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    storeCSRFToken(token);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const storedToken = getCSRFToken();
    
    if (storedToken !== csrfToken) {
      console.error('CSRF token mismatch');
      return;
    }
    
    onSubmit(formData, csrfToken);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  );
};

export default CSRFProtectedForm;
