
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, MessageSquare, Send, Globe, AlertTriangle, Heart, MapPin, Briefcase, Phone } from 'lucide-react';
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

  // Enhanced quick action buttons with emotional context
  const quickActions = [
    { 
      label: { english: "Shelter", swahili: "Makazi", sheng: "Base", arabic: "مأوى" },
      message: { english: "I need a place to sleep tonight", swahili: "Nahitaji mahali pa kulala leo usiku", sheng: "Nahitaji place ya kulala leo", arabic: "أحتاج مكان للنوم الليلة" },
      icon: MapPin,
      variant: "destructive" as const
    },
    { 
      label: { english: "Food", swahili: "Chakula", sheng: "Food", arabic: "طعام" },
      message: { english: "I'm hungry and need food", swahili: "Nina njaa na nahitaji chakula", sheng: "Nina njaa, nahitaji food", arabic: "أنا جوعان وأحتاج طعام" },
      icon: Heart,
      variant: "default" as const
    },
    { 
      label: { english: "Health", swahili: "Afya", sheng: "Health", arabic: "صحة" },
      message: { english: "I need medical help", swahili: "Nahitaji msaada wa kimatibabu", sheng: "Nahitaji medical help", arabic: "أحتاج مساعدة طبية" },
      icon: Phone,
      variant: "default" as const
    },
    { 
      label: { english: "Emergency", swahili: "Dharura", sheng: "Emergency", arabic: "طوارئ" },
      message: { english: "Help! I need urgent assistance", swahili: "Msaada! Nahitaji msaada wa haraka", sheng: "Help! Nahitaji msaada haraka", arabic: "مساعدة! أحتاج مساعدة عاجلة" },
      icon: AlertTriangle,
      variant: "destructive" as const
    },
    { 
      label: { english: "Talk", swahili: "Ongea", sheng: "Talk", arabic: "تحدث" },
      message: { english: "I need someone to talk to", swahili: "Nahitaji mtu wa kuongea naye", sheng: "Nahitaji mtu wa kuongea", arabic: "أحتاج شخص للحديث معه" },
      icon: Heart,
      variant: "outline" as const
    },
    { 
      label: { english: "Jobs", swahili: "Kazi", sheng: "Job", arabic: "وظائف" },
      message: { english: "I need help finding work", swahili: "Nahitaji msaada kupata kazi", sheng: "Nahitaji msaada kupata job", arabic: "أحتاج مساعدة في العثور على عمل" },
      icon: Briefcase,
      variant: "outline" as const
    }
  ];

  return (
    <>
      {/* Enhanced Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 rounded-full w-16 h-16 shadow-lg z-50 bg-primary hover:bg-primary/90 pulse-animation"
          size="icon"
          data-chat-trigger
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      )}

      {/* Enhanced Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 left-6 w-96 h-[32rem] shadow-2xl z-50 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Glo AI Assistant
                <Badge variant="secondary" className="text-xs bg-primary-foreground/20 text-primary-foreground">
                  Available 24/7
                </Badge>
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
          <CardContent className="p-0 flex flex-col h-96">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
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
                      
                      {/* Enhanced message metadata */}
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
                  
                  {/* Enhanced first message with warm welcome */}
                  {index === 0 && message.isBot && (
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
                  
                  {/* Enhanced fallback options with emotional support */}
                  {message.isBot && message.confidence && message.confidence < 0.4 && index > 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Heart className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-yellow-800 mb-2">
                            I want to help you better. You can:
                          </p>
                          <div className="space-y-2">
                            <Link to="/services">
                              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                <Phone className="h-3 w-3 mr-2" />
                                Request Direct Support
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start text-xs"
                              onClick={() => processMessage("How does Glo work?", currentLanguage)}
                            >
                              <Globe className="h-3 w-3 mr-2" />
                              Learn about Glo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoadingIntents && (
                <div className="text-center text-sm text-gray-500 py-4">
                  <div className="animate-pulse">Setting up multilingual support...</div>
                </div>
              )}
            </div>

            {/* Enhanced Quick Actions with emotional context */}
            <div className="px-4 py-3 border-t bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="grid grid-cols-3 gap-1">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const label = action.label[currentLanguage as keyof typeof action.label] || action.label.english;
                  const message = action.message[currentLanguage as keyof typeof action.message] || action.message.english;
                  
                  return (
                    <Button
                      key={index}
                      variant={action.variant}
                      size="sm"
                      onClick={() => processMessage(message, currentLanguage)}
                      className="text-xs h-8 px-2 flex items-center gap-1"
                    >
                      <Icon className="h-3 w-3" />
                      <span className="truncate">{label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Input with emotional support */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    currentLanguage === 'swahili' ? "Niambie unachohitaji..." :
                    currentLanguage === 'sheng' ? "Niambie unachohitaji..." :
                    currentLanguage === 'arabic' ? "أخبريني بما تحتاجينه..." :
                    "Tell me what you need..."
                  }
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 border-gray-300 focus:border-primary"
                />
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  disabled={!inputValue.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {currentLanguage === 'swahili' ? "Mazungumzo yako ni siri na salama" :
                 currentLanguage === 'sheng' ? "Mazungumzo yako ni confidential" :
                 currentLanguage === 'arabic' ? "محادثتك سرية وآمنة" :
                 "Your conversation is confidential and safe"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
