import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, MessageSquare, Send, Globe, AlertTriangle, LifeBuoy } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { getSupportedLanguages } from '@/utils/languageUtils';
import { Link } from 'react-router-dom';

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

  const supportedLanguages = getSupportedLanguages();

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 rounded-full w-14 h-14 shadow-lg z-50"
          size="icon"
          data-chat-trigger
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 left-6 w-80 h-96 shadow-2xl z-50">
          <CardHeader className="bg-primary text-primary-foreground p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Glo AI Assistant
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
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
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary/20 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className="max-w-xs">
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          message.isBot
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-primary text-primary-foreground'
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
                          <Badge variant="outline" className="text-xs">
                            {message.intent}
                          </Badge>
                        )}
                        {message.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}
                        {message.intent?.includes('emergency') && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Emergency
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Add helpful microcopy after the first bot message */}
                  {index === 0 && message.isBot && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        I'm here to help — you can ask for food, shelter, health support, or legal help. 
                        Try typing something like "I need a place to stay."
                      </p>
                    </div>
                  )}
                  
                  {/* Show fallback options if no good match */}
                  {message.isBot && message.confidence && message.confidence < 0.3 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">
                        I'm not sure I understand. You can:
                      </p>
                      <div className="space-y-2">
                        <Link to="/services">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <LifeBuoy className="h-4 w-4 mr-2" />
                            Request Support
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => processMessage("How does Glo work?")}
                        >
                          Learn about Glo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoadingIntents && (
                <div className="text-center text-sm text-gray-500">
                  Loading language support...
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t bg-gray-50">
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => processMessage("I need shelter", currentLanguage)}
                  className="text-xs"
                >
                  Shelter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => processMessage("I need food", currentLanguage)}
                  className="text-xs"
                >
                  Food
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => processMessage("Emergency help", currentLanguage)}
                  className="text-xs"
                >
                  Emergency
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => processMessage("How does Glo work?", currentLanguage)}
                  className="text-xs"
                >
                  Help
                </Button>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
