import React from 'react';
import { Link } from 'react-router-dom';

const ResourcesHeader = () => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-4">Resource Directory</h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-3">
        Browse educational resources and guides. Project GLO provides coordination—services are delivered by independent providers.
      </p>
      <p className="text-sm text-muted-foreground">
        Organizations: <Link to="/dashboard" className="text-primary hover:underline">Access full platform documentation</Link> in your dashboard.
      </p>
    </div>
  );
};

export default ResourcesHeader;
