
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, X } from 'lucide-react';

interface ChatBotHeaderProps {
  currentLanguage: string;
  supportedLanguages: Array<{ code: string; nativeName: string }>;
  onLanguageChange: (language: string) => void;
  onClose: () => void;
}

export const ChatBotHeader = ({ 
  currentLanguage, 
  supportedLanguages, 
  onLanguageChange, 
  onClose 
}: ChatBotHeaderProps) => {
  return (
    <div className="bg-primary text-primary-foreground p-4">
      <div className="flex justify-between items-center">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Glo AI Assistant
          <Badge variant="secondary" className="text-xs bg-primary-foreground/20 text-primary-foreground">
            Available 24/7
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={currentLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-20 h-8 text-xs bg-primary/20 border-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary/20 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
