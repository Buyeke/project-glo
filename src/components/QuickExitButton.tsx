
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const QuickExitButton = () => {
  const handleQuickExit = () => {
    // Replace the current page with Google to avoid back-button issues
    window.location.replace('https://google.com');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={handleQuickExit}
        variant="outline"
        size="sm"
        className="bg-card border-border text-foreground hover:bg-muted text-xs font-medium"
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        Quick Exit
      </Button>
    </div>
  );
};

export default QuickExitButton;
