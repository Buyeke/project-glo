
import React, { useState } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import { getSupportedLanguages } from '@/utils/languageUtils';
import { ChatBotButton } from './chatbot/ChatBotButton';
import { ChatWindow } from './chatbot/ChatWindow';
import { ChatBotStyles } from './chatbot/ChatBotStyles';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { 
    messages, 
    processMessage, 
    currentLanguage, 
    switchLanguage, 
    isLoadingIntents,
    isAIProcessing 
  } = useChatbot();

  const handleSend = async () => {
    if (!inputValue.trim() || isAIProcessing) return;

    const userInput = inputValue;
    setInputValue('');

    // Process the message with AI enhancement
    await processMessage(userInput);
  };

  const handleLanguageChange = (language: string) => {
    switchLanguage(language);
  };

  const handleProcessMessage = async (message: string, language: string) => {
    if (isAIProcessing) return;
    await processMessage(message, language);
  };

  const supportedLanguages = getSupportedLanguages();

  return (
    <>
      <ChatBotStyles />
      
      {/* Chat Button */}
      {!isOpen && (
        <ChatBotButton onClick={() => setIsOpen(true)} />
      )}

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          messages={messages}
          currentLanguage={currentLanguage}
          supportedLanguages={supportedLanguages}
          inputValue={inputValue}
          isLoadingIntents={isLoadingIntents}
          isAIProcessing={isAIProcessing}
          onLanguageChange={handleLanguageChange}
          onClose={() => setIsOpen(false)}
          onInputChange={setInputValue}
          onSend={handleSend}
          onProcessMessage={handleProcessMessage}
        />
      )}
    </>
  );
};

export default ChatBot;
