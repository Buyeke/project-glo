
import React from 'react';
import AdminSetupPanel from '@/components/admin/AdminSetupPanel';

const AdminSetup = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">GLO Admin Setup</h1>
          <p className="text-muted-foreground">
            Initialize admin users for the GLO system
          </p>
        </div>
        <AdminSetupPanel />
      </div>
    </div>
  );
};

export default AdminSetup;
