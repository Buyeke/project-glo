
export interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  language?: string;
  translatedFrom?: string;
  intent?: string;
  confidence?: number;
  matchedService?: string;
  degraded?: boolean;
}

export interface Intent {
  id: string;
  category: string;
  intent_key: string;
  keywords: Record<string, string[]>;
  response_template: Record<string, string>;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  key_features: string[] | null;
  availability: string;
  priority_level: string;
  language_support: string;
  category: string;
  contact_phone: string | null;
  contact_url: string | null;
}

export interface ChatInteraction {
  original_message: string;
  detected_language: string;
  translated_message?: string;
  matched_intent?: string;
  matched_service?: string;
  response: string;
  translated_response?: string;
  confidence_score?: number;
}
