
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChatBotHeader } from './ChatBotHeader';
import { ChatMessage } from './ChatMessage';
import { ChatQuickActions } from './ChatQuickActions';
import { ChatInput } from './ChatInput';
import { AIProcessingIndicator } from './AIProcessingIndicator';
import { ChatMessage as ChatMessageType } from '@/types/chatbot';

interface ChatWindowProps {
  messages: ChatMessageType[];
  currentLanguage: string;
  supportedLanguages: Array<{ code: string; nativeName: string }>;
  inputValue: string;
  isLoadingIntents: boolean;
  isAIProcessing?: boolean;
  onLanguageChange: (language: string) => void;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onProcessMessage: (message: string, language: string) => void;
}

export const ChatWindow = ({
  messages,
  currentLanguage,
  supportedLanguages,
  inputValue,
  isLoadingIntents,
  isAIProcessing = false,
  onLanguageChange,
  onClose,
  onInputChange,
  onSend,
  onProcessMessage
}: ChatWindowProps) => {
  return (
    <Card className="fixed bottom-6 left-6 w-96 h-[32rem] shadow-2xl z-50 border-primary/20">
      <ChatBotHeader
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        onLanguageChange={onLanguageChange}
        onClose={onClose}
      />
      
      <CardContent className="p-0 flex flex-col h-96">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              index={index}
              isFirstMessage={index === 0}
              onProcessMessage={onProcessMessage}
              currentLanguage={currentLanguage}
            />
          ))}
          
          {/* AI Processing Indicator */}
          {isAIProcessing && <AIProcessingIndicator />}
          
          {isLoadingIntents && (
            <div className="text-center text-sm text-gray-500 py-4">
              <div className="animate-pulse">Setting up multilingual support...</div>
            </div>
          )}
        </div>

        <ChatQuickActions
          currentLanguage={currentLanguage}
          onActionClick={onProcessMessage}
        />

        <ChatInput
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSend={onSend}
          currentLanguage={currentLanguage}
          disabled={isAIProcessing}
        />
      </CardContent>
    </Card>
  );
};
