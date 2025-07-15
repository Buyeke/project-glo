
import { translationExamples, getContextualFormality } from './shengTranslationService';

// Enhanced language detection with pattern recognition
export const detectLanguageWithContext = (text: string): {
  language: string;
  confidence: number;
  formality: 'casual' | 'formal' | 'mixed';
  context?: string;
} => {
  const lowerText = text.toLowerCase().trim();
  
  // Arabic detection - check for Arabic characters
  if (/[\u0600-\u06FF]/.test(text)) {
    return { language: 'arabic', confidence: 0.95, formality: 'formal' };
  }
  
  // Enhanced pattern-based detection using training data
  let shengScore = 0;
  let swahiliScore = 0;
  let englishScore = 0;
  let detectedContext = '';
  
  // Check against our translation examples
  for (const example of translationExamples) {
    const shengWords = example.sheng.toLowerCase().split(' ');
    const swahiliWords = example.swahili.toLowerCase().split(' ');
    const englishWords = example.english.toLowerCase().split(' ');
    
    // Score based on word matches
    shengWords.forEach(word => {
      if (lowerText.includes(word) && word.length > 2) {
        shengScore += word.length * 0.3;
        detectedContext = example.context;
      }
    });
    
    swahiliWords.forEach(word => {
      if (lowerText.includes(word) && word.length > 2) {
        swahiliScore += word.length * 0.25;
        detectedContext = example.context;
      }
    });
    
    englishWords.forEach(word => {
      if (lowerText.includes(word) && word.length > 2) {
        englishScore += word.length * 0.2;
      }
    });
  }
  
  // Specific Sheng markers with high confidence
  const shengMarkers = [
    'niaje', 'maze', 'msee', 'poa', 'sawa', 'dough', 'chapaa', 'munde',
    'cheki', 'sort', 'connect', 'fresh', 'down', 'happy', 'stress'
  ];
  
  // Formal Swahili markers
  const swahiliMarkers = [
    'hujambo', 'habari', 'asante', 'karibu', 'samahani', 'nimefurahi',
    'nashukuru', 'nimehuzunika', 'mzuri', 'vizuri'
  ];
  
  // Additional scoring for specific markers
  shengMarkers.forEach(marker => {
    if (lowerText.includes(marker)) {
      shengScore += 5;
    }
  });
  
  swahiliMarkers.forEach(marker => {
    if (lowerText.includes(marker)) {
      swahiliScore += 4;
    }
  });
  
  // Code-switching detection
  const hasEnglishWords = /\b(help|problem|money|work|family|house|food|sick|emergency)\b/i.test(text);
  const hasShengWords = shengScore > 0;
  const hasSwahiliWords = swahiliScore > 0;
  
  const formality = getContextualFormality(text);
  
  // Determine primary language
  let language = 'english';
  let confidence = 0.5;
  
  if (shengScore > swahiliScore && shengScore > englishScore) {
    language = 'sheng';
    confidence = Math.min(0.95, 0.6 + (shengScore / 20));
  } else if (swahiliScore > englishScore) {
    language = 'swahili';
    confidence = Math.min(0.9, 0.6 + (swahiliScore / 15));
  } else if (hasEnglishWords && !hasShengWords && !hasSwahiliWords) {
    language = 'english';
    confidence = 0.7;
  }
  
  // Handle code-switching - prefer Sheng for mixed content
  if (hasShengWords && (hasEnglishWords || hasSwahiliWords)) {
    language = 'sheng';
    confidence = Math.min(0.85, confidence + 0.1);
  }
  
  return {
    language,
    confidence,
    formality,
    context: detectedContext || undefined
  };
};

// Enhanced greeting detection with cultural context
export const getContextualGreetingEnhanced = (language: string, formality: 'casual' | 'formal' | 'mixed'): string => {
  const hour = new Date().getHours();
  
  const greetings = {
    sheng: {
      casual: {
        morning: 'Sasa bro! Mambo za asubuhi?',
        afternoon: 'Niaje maze! Vipi mchana?',
        evening: 'Mambo! Poa usiku?'
      },
      formal: {
        morning: 'Habari za asubuhi, rafiki?',
        afternoon: 'Habari za mchana?',
        evening: 'Habari za jioni?'
      },
      mixed: {
        morning: 'Sasa! Habari za asubuhi?',
        afternoon: 'Niaje! Mambo za mchana?',
        evening: 'Poa! Habari za jioni?'
      }
    },
    swahili: {
      casual: {
        morning: 'Habari za asubuhi?',
        afternoon: 'Habari za mchana?',
        evening: 'Habari za jioni?'
      },
      formal: {
        morning: 'Hujambo? Habari za asubuhi?',
        afternoon: 'Hujambo? Habari za mchana?',
        evening: 'Hujambo? Habari za jioni?'
      },
      mixed: {
        morning: 'Habari za asubuhi?',
        afternoon: 'Habari za mchana?',
        evening: 'Habari za jioni?'
      }
    },
    english: {
      casual: {
        morning: 'Good morning!',
        afternoon: 'Good afternoon!',
        evening: 'Good evening!'
      },
      formal: {
        morning: 'Good morning! How are you?',
        afternoon: 'Good afternoon! How are you?',
        evening: 'Good evening! How are you?'
      },
      mixed: {
        morning: 'Good morning!',
        afternoon: 'Good afternoon!',
        evening: 'Good evening!'
      }
    },
    arabic: {
      casual: { morning: 'السلام عليكم', afternoon: 'السلام عليكم', evening: 'السلام عليكم' },
      formal: { morning: 'السلام عليكم', afternoon: 'السلام عليكم', evening: 'السلام عليكم' },
      mixed: { morning: 'السلام عليكم', afternoon: 'السلام عليكم', evening: 'السلام عليكم' }
    }
  };
  
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const langGreetings = greetings[language as keyof typeof greetings] || greetings.english;
  
  return langGreetings[formality][timeOfDay as keyof typeof langGreetings[typeof formality]];
};
