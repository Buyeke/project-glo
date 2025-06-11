
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, MessageSquare, Send } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Glo's AI assistant. I'm here to help you find resources, answer questions about our services, or guide you to the support you need. How can I help you today?",
      isBot: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate bot response (in real implementation, this would call your AI service)
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        isBot: true,
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('shelter') || lowerInput.includes('housing')) {
      return "I can help you find emergency shelter and housing options. Would you like me to show you available shelters in your area? I can also connect you with our housing specialists.";
    } else if (lowerInput.includes('job') || lowerInput.includes('employment')) {
      return "Our job placement program can help you find employment opportunities. We offer resume building, interview prep, and connections to employers who support our mission.";
    } else if (lowerInput.includes('mental health') || lowerInput.includes('counseling')) {
      return "We provide mental health support including counseling services, support groups, and crisis intervention. Would you like me to connect you with a mental health specialist?";
    } else if (lowerInput.includes('donation') || lowerInput.includes('donate')) {
      return "Thank you for wanting to support our mission! You can make a secure donation through our donation page. Every contribution helps us provide essential services to women and children in need.";
    } else {
      return "I'm here to help you navigate our services. I can assist with finding shelter, job opportunities, mental health resources, addiction recovery, or answer questions about our programs. What would you like to know more about?";
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-2xl z-50">
          <CardHeader className="bg-primary text-primary-foreground p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Glo AI Assistant</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg text-sm ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
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
