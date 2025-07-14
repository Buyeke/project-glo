
import React, { useState } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import { getSupportedLanguages } from '@/utils/languageUtils';
import { ChatBotButton } from './chatbot/ChatBotButton';
import { ChatWindow } from './chatbot/ChatWindow';
import { ChatBotStyles } from './chatbot/ChatBotStyles';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, processMessage, currentLanguage, switchLanguage, isLoadingIntents } = useChatbot();

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue;
    setInputValue('');

    // Process the message
    await processMessage(userInput);
  };

  const handleLanguageChange = (language: string) => {
    switchLanguage(language);
  };

  const handleProcessMessage = async (message: string, language: string) => {
    await processMessage(message, language);
  };

  const supportedLanguages = getSupportedLanguages();

  return (
    <>
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
          onLanguageChange={handleLanguageChange}
          onClose={() => setIsOpen(false)}
          onInputChange={setInputValue}
          onSend={handleSend}
          onProcessMessage={handleProcessMessage}
        />
      )}

      <ChatBotStyles />
    </>
  );
};

export default ChatBot;
