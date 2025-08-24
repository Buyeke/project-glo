
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';

const FloatingHelpButton = () => {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        size="lg"
        className="rounded-full h-14 w-14 sm:h-auto sm:w-auto sm:px-6 shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-white"
        asChild
      >
        <Link to="/services" className="flex items-center gap-2">
          <LifeBuoy className="h-6 w-6" />
          <span className="hidden sm:inline font-semibold">Request Help</span>
        </Link>
      </Button>
    </div>
  );
};

export default FloatingHelpButton;
