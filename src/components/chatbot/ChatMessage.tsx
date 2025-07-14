
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Heart } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chatbot';

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
  isFirstMessage: boolean;
  onProcessMessage: (message: string, language: string) => void;
  currentLanguage: string;
}

export const ChatMessage = ({ 
  message, 
  index, 
  isFirstMessage, 
  onProcessMessage, 
  currentLanguage 
}: ChatMessageProps) => {
  return (
    <div key={message.id}>
      <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
        <div className="max-w-xs">
          <div
            className={`p-3 rounded-lg text-sm leading-relaxed ${
              message.isBot
                ? 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                : 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
            }`}
          >
            {message.text}
          </div>
          
          {/* Message metadata */}
          <div className="flex flex-wrap gap-1 mt-1">
            {message.language && message.language !== 'english' && (
              <Badge variant="secondary" className="text-xs">
                {message.language}
              </Badge>
            )}
            {message.intent && (
              <Badge variant="outline" className="text-xs capitalize">
                {message.intent.replace('_', ' ')}
              </Badge>
            )}
            {message.confidence && message.confidence > 0.7 && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                High match
              </Badge>
            )}
            {message.intent?.includes('emergency') && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Emergency
              </Badge>
            )}
            {message.intent?.includes('emotional') && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                <Heart className="h-3 w-3 mr-1" />
                Support
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Welcome message for first bot message */}
      {isFirstMessage && message.isBot && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-2">
                You're safe here. This is a confidential space just for you.
              </p>
              <p className="text-xs text-blue-700">
                Try typing what you need like "I need food" or "I feel overwhelmed" - or use the quick buttons below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Low confidence fallback for non-first messages */}
      {message.isBot && message.confidence && message.confidence < 0.4 && index > 0 && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Heart className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 mb-2">
                I want to help you better. You can:
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => onProcessMessage("How does Glo work?", currentLanguage)}
                  className="w-full justify-start text-xs bg-white border border-yellow-300 hover:bg-yellow-50 px-3 py-1 rounded text-yellow-800"
                >
                  Learn about Glo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
