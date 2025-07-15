
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Move } from 'lucide-react';

const QuickExitButton = () => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

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
    if (!isDragging) return;

    const newX = Math.max(0, Math.min(window.innerWidth - 120, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragStart.y));

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
