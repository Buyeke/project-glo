
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResourcesCTA = () => {
  return (
    <Card className="mt-12 bg-primary text-primary-foreground">
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Additional Support?</h2>
        <p className="text-lg mb-6">
          Can't find what you're looking for? Our AI assistant can help connect you with personalized resources, or contact us directly for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" size="lg" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat with Glo Assistant
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2 text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
            <Link to="/contact">
              <Mail className="h-4 w-4" />
              Go to Contact Form
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesCTA;
