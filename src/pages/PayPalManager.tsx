
import React from 'react';
import PayPalAccountManager from '@/components/admin/PayPalAccountManager';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const PayPalManager: React.FC = () => {
  const { user, session } = useAuth();

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PayPal Account Manager</h1>
          <p className="text-gray-600 mt-2">
            Safely switch to a new PayPal account and test the integration
          </p>
        </div>
        
        <PayPalAccountManager />
      </div>
    </div>
  );
};

export default PayPalManager;
