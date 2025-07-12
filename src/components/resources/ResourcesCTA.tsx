
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ResourcesCTA = () => {
  return (
    <Card className="mt-12 bg-primary text-primary-foreground">
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Additional Support?</h2>
        <p className="text-lg mb-6">
          Can't find what you're looking for? Our AI assistant can help connect you with personalized resources.
        </p>
        <Button variant="secondary" size="lg">
          Chat with Glo Assistant
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResourcesCTA;
