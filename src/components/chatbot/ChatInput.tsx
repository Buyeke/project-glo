
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  currentLanguage: string;
}

export const ChatInput = ({ 
  inputValue, 
  onInputChange, 
  onSend, 
  currentLanguage 
}: ChatInputProps) => {
  const getPlaceholder = () => {
    switch (currentLanguage) {
      case 'swahili':
        return "Niambie unachohitaji...";
      case 'sheng':
        return "Niambie unachohitaji bro...";
      case 'arabic':
        return "أخبريني بما تحتاجينه...";
      default:
        return "Tell me what you need...";
    }
  };

  const getConfidentialityText = () => {
    switch (currentLanguage) {
      case 'swahili':
        return "Mazungumzo yako ni siri na salama";
      case 'sheng':
        return "Conversation yako ni confidential na safe";
      case 'arabic':
        return "محادثتك سرية وآمنة";
      default:
        return "Your conversation is confidential and safe";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={getPlaceholder()}
          onKeyPress={handleKeyPress}
          className="flex-1 border-gray-300 focus:border-primary"
        />
        <Button 
          onClick={onSend} 
          size="icon"
          disabled={!inputValue.trim()}
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {getConfidentialityText()}
      </p>
    </div>
  );
};
