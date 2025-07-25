
import { matchShengIntent, generateShengResponse } from './shengIntentMatcher';
import { matchIntent as originalMatchIntent } from './intentMatcher';

interface Intent {
  id: string;
  category: string;
  intent_key: string;
  keywords: Record<string, string[]>;
  response_template: Record<string, string>;
}

// Enhanced intent matcher that combines original logic with Sheng expressions
export const enhancedMatchIntent = (
  message: string, 
  intents: Intent[], 
  language: string = 'sheng'
): { 
  intent: Intent | null; 
  confidence: number; 
  shengMatch?: any;
  urgency?: string;
  category?: string;
} => {
  console.log('Enhanced intent matching for:', message);
  
  // First, try Sheng intent matching
  const shengResult = matchShengIntent(message);
  
  if (shengResult.intent && shengResult.confidence > 0.6) {
    console.log('Sheng intent matched:', shengResult.intent);
    
    // Create a synthetic intent based on Sheng match
    const syntheticIntent: Intent = {
      id: `sheng_${shengResult.intent.category}`,
      category: shengResult.intent.category,
      intent_key: shengResult.intent.intent,
      keywords: {
        sheng: [shengResult.intent.sheng],
        swahili: [shengResult.intent.meaning],
        english: [shengResult.intent.meaning]
      },
      response_template: {
        sheng: generateShengResponse(shengResult.intent, 'sheng'),
        swahili: generateShengResponse(shengResult.intent, 'swahili'),
        english: generateShengResponse(shengResult.intent, 'english')
      }
    };
    
    return {
      intent: syntheticIntent,
      confidence: shengResult.confidence,
      shengMatch: shengResult.intent,
      urgency: shengResult.intent.urgency,
      category: shengResult.intent.category
    };
  }
  
  // Fall back to original intent matching
  const originalResult = originalMatchIntent(message, intents, language);
  
  return {
    intent: originalResult.intent,
    confidence: originalResult.confidence,
    urgency: 'medium',
    category: originalResult.intent?.category || 'support'
  };
};
