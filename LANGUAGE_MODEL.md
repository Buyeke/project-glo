# Project GLO - Language Model & Translation System

## Overview

Project GLO implements a sophisticated multilingual system supporting English, Swahili, and Sheng, with architecture designed for easy extension to additional languages like Mayan dialects.

## Supported Languages

### Primary Languages

1. **English (en)**
   - Standard language for documentation
   - Default fallback language
   - Full feature support

2. **Swahili (sw)**
   - Official language of Kenya
   - Formal communication
   - Full translation coverage

3. **Sheng (sheng)**
   - Kenyan urban youth dialect
   - Mixed Swahili-English slang
   - Street-level communication
   - Cultural nuance support

## Language Detection System

### Detection Methods

#### 1. Automatic Detection
Uses the `franc` library for statistical language identification.

```typescript
import franc from 'franc';

function detectLanguage(text: string): string {
  const detected = franc(text);
  
  // Map ISO codes
  const languageMap: Record<string, string> = {
    'eng': 'en',
    'swa': 'sw',
    'und': 'sheng' // Unknown often indicates Sheng
  };
  
  return languageMap[detected] || 'en';
}
```

#### 2. Pattern-Based Detection
Enhanced detection for Sheng using keyword patterns.

```typescript
function detectLanguageWithContext(text: string): {
  language: string;
  confidence: number;
  formality: 'casual' | 'formal' | 'mixed';
} {
  // Sheng markers
  const shengPatterns = [
    'niaje', 'nini', 'maze', 'fiti', 'poa', 'buda',
    'manzi', 'dem', 'brathe', 'kimeumana', 'story'
  ];
  
  // Swahili markers
  const swahiliPatterns = [
    'habari', 'asante', 'tafadhali', 'samahani',
    'ndiyo', 'hapana', 'rafiki'
  ];
  
  // Count matches
  const shengScore = countMatches(text, shengPatterns);
  const swahiliScore = countMatches(text, swahiliPatterns);
  
  // Determine language and formality
  if (shengScore > swahiliScore) {
    return {
      language: 'sheng',
      confidence: calculateConfidence(shengScore),
      formality: 'casual'
    };
  } else if (swahiliScore > 0) {
    return {
      language: 'sw',
      confidence: calculateConfidence(swahiliScore),
      formality: 'formal'
    };
  }
  
  return {
    language: 'en',
    confidence: 0.7,
    formality: 'mixed'
  };
}
```

## Translation System

### Architecture

```
User Input → Language Detection → Intent Recognition
                                        ↓
    Output ← Translation Service ← Response Generation
```

### Translation Service

#### Core Translation Function

```typescript
interface TranslationService {
  translate(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string>;
  
  translateWithContext(
    text: string,
    context: string,
    fromLang: string,
    toLang: string
  ): Promise<string>;
}
```

#### Implementation

```typescript
const translations: Record<string, Record<string, string>> = {
  // Greetings
  'hello': {
    'en': 'Hello',
    'sw': 'Habari',
    'sheng': 'Niaje'
  },
  'goodbye': {
    'en': 'Goodbye',
    'sw': 'Kwaheri',
    'sheng': 'Tuonane'
  },
  
  // Emergency
  'help': {
    'en': 'Help',
    'sw': 'Msaada',
    'sheng': 'Nisaidie'
  },
  'emergency': {
    'en': 'Emergency',
    'sw': 'Dharura',
    'sheng': 'Hali mbaya'
  },
  
  // Services
  'counseling': {
    'en': 'Counseling',
    'sw': 'Ushauri',
    'sheng': 'Therapy'
  }
};

function translate(key: string, language: string): string {
  return translations[key]?.[language] || translations[key]?.['en'] || key;
}
```

### AI-Powered Translation

For complex sentences, uses OpenAI API:

```typescript
async function aiTranslate(
  text: string,
  targetLang: string
): Promise<string> {
  const prompt = `Translate to ${targetLang}: ${text}
  
  Context: This is for a trauma support service in Kenya.
  Maintain cultural sensitivity and appropriate tone.`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a cultural translator.' },
      { role: 'user', content: prompt }
    ]
  });
  
  return response.choices[0].message.content;
}
```

## Sheng Language Support

### Characteristics

1. **Code-Switching**
   - Mixes Swahili, English, and slang
   - Dynamic vocabulary
   - Urban youth culture

2. **Informal Grammar**
   - Simplified structures
   - Borrowed words from multiple languages
   - Context-dependent meanings

### Sheng Dictionary

```typescript
const shengDictionary = {
  // Basic Communication
  'niaje': 'hello/how are you',
  'poa': 'cool/good/fine',
  'sawa': 'okay',
  'maze': 'problem/issue',
  'story': 'what\'s up/situation',
  
  // People
  'buda': 'friend/brother',
  'manzi': 'woman/girlfriend',
  'dem': 'them/those people',
  'brathe': 'brother',
  
  // Actions
  'cheki': 'check/look',
  'kuja': 'come',
  'rudi': 'return',
  'tulia': 'calm down/wait',
  
  // States
  'fiti': 'great/perfect',
  'tight': 'difficult/tough',
  'kimeumana': 'it hurts/difficult',
  
  // Emergency
  'nisaidie': 'help me',
  'hali mbaya': 'bad situation',
  'nataka msaada': 'i need help'
};
```

### Sheng Intent Matching

```typescript
function matchShengIntent(message: string): {
  intent: string;
  confidence: number;
} {
  const lowerMessage = message.toLowerCase();
  
  // Emergency patterns
  if (/nisaidie|hali mbaya|nataka msaada/.test(lowerMessage)) {
    return { intent: 'emergency', confidence: 0.95 };
  }
  
  // Greeting patterns
  if (/niaje|mambo|poa|vipi/.test(lowerMessage)) {
    return { intent: 'greeting', confidence: 0.9 };
  }
  
  // Problem/concern patterns
  if (/maze|shida|issue|problem/.test(lowerMessage)) {
    return { intent: 'concern', confidence: 0.85 };
  }
  
  return { intent: 'unknown', confidence: 0.5 };
}
```

## Cultural Response Adaptation

### Context-Aware Responses

```typescript
function generateCulturalResponse(
  intent: string,
  language: string,
  formality: 'casual' | 'formal'
): string {
  const responses = {
    greeting: {
      en: {
        casual: 'Hey there! How can I help?',
        formal: 'Hello. How may I assist you today?'
      },
      sw: {
        casual: 'Habari! Naweza kukusaidia vipi?',
        formal: 'Habari yako. Ninaweza kukusaidia namna gani leo?'
      },
      sheng: {
        casual: 'Niaje buda! Story yako nini?',
        formal: 'Poa. Unaweza nisaidie aje?'
      }
    },
    
    emergency: {
      en: {
        casual: 'I understand this is urgent. Let me help you right away.',
        formal: 'I understand you need immediate assistance. I am here to help.'
      },
      sw: {
        casual: 'Naelewa hii ni haraka. Nitakusaidia sasa.',
        formal: 'Naelewa unahitaji msaada wa haraka. Niko hapa kukusaidia.'
      },
      sheng: {
        casual: 'Poa maze umeniona! Nitakusort haraka.',
        formal: 'Sawa buda, niko hapa. Nitakusaidia kimeumana.'
      }
    }
  };
  
  return responses[intent]?.[language]?.[formality] || 
         responses[intent]?.['en']?.['formal'];
}
```

## Extending to New Languages

### Adding Mayan Language Support

The system is designed for easy language extension:

#### Step 1: Add Language Code

```typescript
const SUPPORTED_LANGUAGES = {
  en: 'English',
  sw: 'Swahili',
  sheng: 'Sheng',
  may: 'Mayan' // New language
};
```

#### Step 2: Create Translation Dictionary

```typescript
const mayanTranslations = {
  'hello': 'Báʼax ka waʼalik',
  'goodbye': 'Tuméen',
  'help': 'Aʼantik',
  'emergency': 'Urgencia',
  'thank_you': 'Yum boʼotik',
  // ... more translations
};
```

#### Step 3: Add Detection Patterns

```typescript
const mayanPatterns = [
  'báʼax', 'tuméen', 'aʼantik', 'yum', 'boʼotik'
  // Add distinctive Mayan words
];

function detectMayan(text: string): boolean {
  return mayanPatterns.some(pattern => 
    text.toLowerCase().includes(pattern)
  );
}
```

#### Step 4: Create Cultural Responses

```typescript
const mayanResponses = {
  greeting: {
    casual: 'Báʼax ka waʼalik! ¿Tuméen in wáaj?',
    formal: 'Báʼax ka waʼalik. ¿Bix inw aʼantik teech beʼora?'
  },
  emergency: {
    casual: 'Tin naʼatik u urgencia. Táan in wáaj teech waʼalak.',
    formal: 'Tin naʼatik kaʼanan aʼantik urgente. Táan waye\' in aʼantik teech.'
  }
};
```

#### Step 5: Update Language Selector

```typescript
// Add to UI language options
const languageOptions = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'sheng', name: 'Sheng', flag: '🗣️' },
  { code: 'may', name: 'Mayan', flag: '🇬🇹' }
];
```

## Text-to-Speech Integration

### ElevenLabs API

Converts text to speech in multiple languages:

```typescript
async function textToSpeech(
  text: string,
  language: string
): Promise<Blob> {
  const voiceMap = {
    'en': 'voice-english-id',
    'sw': 'voice-swahili-id',
    'sheng': 'voice-swahili-casual-id'
  };
  
  const response = await elevenlabs.textToSpeech({
    text,
    voice_id: voiceMap[language] || voiceMap['en'],
    model_id: 'eleven_multilingual_v2'
  });
  
  return response.audio;
}
```

## Best Practices

### 1. Language Detection
- Always provide manual language override
- Use context for better accuracy
- Handle code-switching gracefully

### 2. Translation Quality
- Maintain cultural context
- Test with native speakers
- Keep informal/formal distinctions

### 3. Performance
- Cache common translations
- Batch translation requests
- Use CDN for language assets

### 4. Accessibility
- Provide text alternatives for audio
- Support screen readers in all languages
- Maintain consistent terminology

## Data Sources

### Training Data
- Kenyan social media posts (Sheng)
- Official government documents (Swahili)
- Community feedback and corrections
- Professional translator reviews

### Continuous Improvement
- User feedback collection
- A/B testing of translations
- Regular updates to slang dictionary
- Community contribution system

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-10  
**Languages Supported:** 3 (extensible)  
**Translation Methods:** Rule-based + AI hybrid
