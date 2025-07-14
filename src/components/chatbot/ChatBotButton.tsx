
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ChatBotButtonProps {
  onClick: () => void;
}

export const ChatBotButton = ({ onClick }: ChatBotButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 left-6 rounded-full w-16 h-16 shadow-lg z-50 bg-primary hover:bg-primary/90 pulse-animation"
      size="icon"
      data-chat-trigger
    >
      <MessageSquare className="h-7 w-7" />
    </Button>
  );
};
