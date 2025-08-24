
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Move } from 'lucide-react';

const QuickExitButton = () => {
  const [position, setPosition] = useState({ x: 0, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Set initial position to top-right on mount
  useEffect(() => {
    const setInitialPosition = () => {
      if (buttonRef.current) {
        const buttonWidth = buttonRef.current.offsetWidth || 120;
        const initialX = window.innerWidth - buttonWidth - 20;
        setPosition({ x: Math.max(0, initialX), y: 20 });
      }
    };

    // Set position after component mounts and gets dimensions
    setTimeout(setInitialPosition, 0);
    
    // Update position on window resize
    window.addEventListener('resize', setInitialPosition);
    return () => window.removeEventListener('resize', setInitialPosition);
  }, []);

  const handleQuickExit = () => {
    // Replace the current page with Google to avoid back-button issues
    window.location.replace('https://google.com');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !buttonRef.current) return;

    const buttonWidth = buttonRef.current.offsetWidth || 120;
    const buttonHeight = buttonRef.current.offsetHeight || 40;

    const newX = Math.max(0, Math.min(window.innerWidth - buttonWidth, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - buttonHeight, e.clientY - dragStart.y));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      ref={buttonRef}
      className={`fixed z-50 flex items-center gap-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        data-drag-handle
        className="flex items-center justify-center w-6 h-6 bg-muted/80 hover:bg-muted rounded-l border border-r-0 border-border cursor-grab active:cursor-grabbing"
      >
        <Move className="h-3 w-3 text-muted-foreground" />
      </div>
      <Button
        onClick={handleQuickExit}
        variant="outline"
        size="sm"
        className="bg-card border-border text-foreground hover:bg-muted text-xs font-medium rounded-l-none"
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        Quick Exit
      </Button>
    </div>
  );
};

export default QuickExitButton;
