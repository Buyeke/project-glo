
import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

export const AIProcessingIndicator = () => {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
      <div className="relative">
        <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
        <Sparkles className="h-3 w-3 text-purple-600 absolute -top-1 -right-1 animate-bounce" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-blue-800 mb-1">
          AI is thinking...
        </div>
        <div className="text-xs text-blue-600">
          Analyzing your message with advanced understanding
        </div>
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};
