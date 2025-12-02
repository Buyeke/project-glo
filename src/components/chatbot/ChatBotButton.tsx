
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
      className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg z-50 bg-primary hover:bg-primary/90 pulse-animation"
      size="icon"
      data-chat-trigger
    >
      <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />
    </Button>
  );
};
