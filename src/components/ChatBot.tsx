
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
      text: "Hi! I'm Glo's AI assistant. I'm here to help you navigate our services and find the support you need. We've helped 50+ women and 100+ children through our network of 10+ shelter partners. How can I assist you today?",
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

    // Simulate bot response
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
    
    if (lowerInput.includes('shelter') || lowerInput.includes('housing') || lowerInput.includes('emergency')) {
      return "Glo provides emergency shelter access through our network of 10+ partner facilities. We offer safe housing, essential resources, and 24/7 support. I can help connect you with immediate shelter placement. Would you like me to find available shelters in your area?";
    } else if (lowerInput.includes('job') || lowerInput.includes('employment') || lowerInput.includes('work')) {
      return "Our Job & Skills Support program offers training, resume building, interview preparation, and job placement assistance. We've helped many women gain independence through employment. Would you like information about our current training programs or job opportunities?";
    } else if (lowerInput.includes('mental health') || lowerInput.includes('counseling') || lowerInput.includes('therapy')) {
      return "Glo's Personalized Referrals service uses AI to connect you with mental health professionals and counseling services. We work with community partners to provide therapy, support groups, and crisis intervention. Would you like me to help match you with mental health resources?";
    } else if (lowerInput.includes('addiction') || lowerInput.includes('recovery') || lowerInput.includes('substance')) {
      return "We provide connections to addiction recovery programs through our AI-powered referral system. Our partners offer detox services, rehabilitation programs, and ongoing support for substance abuse recovery. Can I help you find recovery resources in your area?";
    } else if (lowerInput.includes('children') || lowerInput.includes('kids') || lowerInput.includes('family')) {
      return "Glo has supported over 100 children alongside their mothers. We provide family-friendly shelter options, parenting workshops, childcare resources, and educational support. Our services ensure both you and your children receive comprehensive care. What specific support do you need for your family?";
    } else if (lowerInput.includes('education') || lowerInput.includes('skills') || lowerInput.includes('training')) {
      return "Our Education & Life Skills program offers workshops on financial literacy, parenting, wellness, and digital literacy. These classes help build the foundation for long-term independence and stability. Would you like to know about upcoming workshops or specific skill-building programs?";
    } else if (lowerInput.includes('legal') || lowerInput.includes('lawyer') || lowerInput.includes('court')) {
      return "Through our Community Integration services, we can connect you with legal aid organizations that provide assistance with housing issues, family law, immigration, and other legal matters. Would you like me to help you find legal assistance in your area?";
    } else if (lowerInput.includes('donation') || lowerInput.includes('donate') || lowerInput.includes('support glo')) {
      return "Thank you for wanting to support our mission! You can make a secure donation through our donation page, which accepts PayPal and other payment methods. Every contribution helps us provide essential services to homeless women and children. You can also support us by shopping our handmade goods created by residents and local women.";
    } else if (lowerInput.includes('volunteer') || lowerInput.includes('help out') || lowerInput.includes('get involved')) {
      return "We welcome volunteers! You can help by mentoring women, teaching skills workshops, providing childcare during services, or assisting with our resource directory. Please create an account and specify that you're interested in volunteering, and we'll connect you with opportunities that match your skills and availability.";
    } else if (lowerInput.includes('glo') || lowerInput.includes('about') || lowerInput.includes('what is')) {
      return "Glo is an AI-powered social platform supporting homeless women and children. We've helped 50+ women and 100+ children through our comprehensive services including shelter access, job placement, mental health support, education, and community integration. Our AI system provides personalized referrals to match users with the most relevant resources and services.";
    } else {
      return "I'm here to help you navigate Glo's comprehensive support services. I can assist with finding shelter (emergency and transitional housing), job placement and skills training, mental health and addiction recovery resources, education and life skills workshops, legal aid, and community integration services. What specific support are you looking for today?";
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
