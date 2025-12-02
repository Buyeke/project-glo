
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChatBotHeader } from './ChatBotHeader';
import { ChatMessage } from './ChatMessage';
import { ChatQuickActions } from './ChatQuickActions';
import { ChatInput } from './ChatInput';
import { VoiceControls } from './VoiceControls';
import { AIProcessingIndicator } from './AIProcessingIndicator';
import { ProactiveFollowUps } from './ProactiveFollowUps';
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
  const lastBotMessage = messages.filter(m => m.isBot).pop()?.text;

  const handleVoiceInput = (text: string) => {
    onInputChange(text);
    setTimeout(() => onSend(), 100); // Small delay to ensure input is set
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto w-full sm:w-96 h-[100dvh] sm:h-[36rem] shadow-2xl z-50 border-primary/20 rounded-none sm:rounded-lg">
      <ChatBotHeader
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        onLanguageChange={onLanguageChange}
        onClose={onClose}
      />
      
      <CardContent className="p-0 flex flex-col h-[calc(100dvh-4rem)] sm:h-[32rem]">
        {/* Proactive Follow-ups */}
        <ProactiveFollowUps onActionClick={onProcessMessage} />
        
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

        <VoiceControls
          onVoiceInput={handleVoiceInput}
          lastBotMessage={lastBotMessage}
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
