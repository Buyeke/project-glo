
import { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chatbot';
import { useAuth } from '@/hooks/useAuth';

interface ConversationMemory {
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
  context: {
    primaryConcerns: string[];
    preferredLanguage: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    servicesDiscussed: string[];
    emotionalState: string;
    lastInteraction: string;
  };
}

export const useConversationMemory = () => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<ConversationMemory | null>(null);

  // Generate session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize or restore conversation memory
  useEffect(() => {
    if (user) {
      const storedMemory = localStorage.getItem(`conversation_${user.id}`);
      
      if (storedMemory) {
        try {
          const parsed = JSON.parse(storedMemory);
          // Check if session is less than 24 hours old
          const lastInteraction = new Date(parsed.context.lastInteraction);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setMemory(parsed);
            console.log('Restored conversation memory:', parsed.context);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored memory:', error);
        }
      }

      // Create new memory
      const newMemory: ConversationMemory = {
        userId: user.id,
        sessionId: generateSessionId(),
        messages: [],
        context: {
          primaryConcerns: [],
          preferredLanguage: 'english',
          urgencyLevel: 'low',
          servicesDiscussed: [],
          emotionalState: 'neutral',
          lastInteraction: new Date().toISOString(),
        }
      };
      
      setMemory(newMemory);
    }
  }, [user]);

  // Update memory with new message
  const updateMemory = (message: ChatMessage, analysis?: any) => {
    if (!memory) return;

    const updatedMemory = {
      ...memory,
      messages: [...memory.messages, message],
      context: {
        ...memory.context,
        lastInteraction: new Date().toISOString(),
        ...(analysis && {
          urgencyLevel: analysis.urgency || memory.context.urgencyLevel,
          emotionalState: analysis.emotional_state || memory.context.emotionalState,
          preferredLanguage: analysis.language_detected || memory.context.preferredLanguage,
          primaryConcerns: analysis.services_needed ? 
            [...new Set([...memory.context.primaryConcerns, ...analysis.services_needed])] : 
            memory.context.primaryConcerns,
        })
      }
    };

    setMemory(updatedMemory);
    
    // Persist to localStorage
    if (user) {
      localStorage.setItem(`conversation_${user.id}`, JSON.stringify(updatedMemory));
    }
  };

  // Get conversation context for AI
  const getContextSummary = () => {
    if (!memory) return '';

    const { context } = memory;
    return `
User Context:
- Primary concerns: ${context.primaryConcerns.join(', ') || 'None identified'}
- Preferred language: ${context.preferredLanguage}
- Current urgency: ${context.urgencyLevel}
- Emotional state: ${context.emotionalState}
- Services discussed: ${context.servicesDiscussed.join(', ') || 'None'}
- Session duration: ${memory.messages.length} messages
`;
  };

  // Clear memory (for privacy/logout)
  const clearMemory = () => {
    if (user) {
      localStorage.removeItem(`conversation_${user.id}`);
    }
    setMemory(null);
  };

  return {
    memory,
    updateMemory,
    getContextSummary,
    clearMemory,
    hasMemory: !!memory,
  };
};
