
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  currentLanguage: string;
  disabled?: boolean;
}

export const ChatInput = ({ 
  inputValue, 
  onInputChange, 
  onSend, 
  currentLanguage,
  disabled = false 
}: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSend();
    }
  };

  const getPlaceholder = () => {
    switch (currentLanguage) {
      case 'sheng':
        return 'Andika hapa mresh... polepole tu 💜';
      case 'swahili':
        return 'Andika ujumbe wako hapa polepole...';
      case 'arabic':
        return 'اكتبي رسالتك هنا بهدوء...';
      default:
        return 'Type your message here gently...';
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className={`flex-1 ${disabled ? 'opacity-50' : ''}`}
        />
        <Button 
          onClick={onSend} 
          size="sm"
          disabled={disabled || !inputValue.trim()}
          className="min-w-[44px]"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      {disabled && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          GLO anafikiria message yako... polepole tu 💜
        </div>
      )}
    </div>
  );
};
