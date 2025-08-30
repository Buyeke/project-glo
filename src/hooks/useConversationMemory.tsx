
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface ConversationContext {
  lastTopic?: string;
  lastLanguage?: string;
  sessionStart?: string;
  // Removed: messageHistory, userPreferences, personalInfo
}

export const useConversationMemory = () => {
  const { user } = useAuth();
  const [context, setContext] = useState<ConversationContext>({});

  // Use sessionStorage instead of localStorage for better privacy
  const getStorageKey = () => `chat_context_${user?.id || 'anonymous'}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(getStorageKey());
        if (stored) {
          const parsed = JSON.parse(stored);
          // Only restore non-sensitive context data
          setContext({
            lastTopic: parsed.lastTopic,
            lastLanguage: parsed.lastLanguage,
            sessionStart: parsed.sessionStart || new Date().toISOString()
          });
        } else {
          setContext({
            sessionStart: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error loading conversation context:', error);
        setContext({
          sessionStart: new Date().toISOString()
        });
      }
    }
  }, [user?.id]);

  const updateContext = (updates: Partial<ConversationContext>) => {
    const newContext = { ...context, ...updates };
    setContext(newContext);
    
    if (typeof window !== 'undefined') {
      try {
        // Only store minimal, non-sensitive data
        const toStore = {
          lastTopic: newContext.lastTopic,
          lastLanguage: newContext.lastLanguage,
          sessionStart: newContext.sessionStart
        };
        sessionStorage.setItem(getStorageKey(), JSON.stringify(toStore));
      } catch (error) {
        console.error('Error saving conversation context:', error);
      }
    }
  };

  const clearContext = () => {
    setContext({
      sessionStart: new Date().toISOString()
    });
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(getStorageKey());
    }
  };

  // Clear context on user change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(getStorageKey());
      }
    };
  }, [user?.id]);

  return {
    context,
    updateContext,
    clearContext
  };
};
