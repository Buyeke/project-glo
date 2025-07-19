// Enhanced language detection utility with comprehensive Sheng and Swahili support
// Fixed version with proper types, optimized performance, and error handling

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
}

export interface DetectionResult {
  language: string;
  confidence: number;
  hasCodeSwitching: boolean;
  detectedLanguages: string[];
}

export interface EmotionalContext {
  state: 'distressed' | 'grateful' | 'urgent' | 'neutral';
  intensity: 'low' | 'medium' | 'high';
  culturalMarkers: string[];
}

export interface ResponseContext {
  style: 'formal' | 'casual' | 'mixed';
  emotionalState: EmotionalContext;
  timeBasedGreeting: string;
}

// Optimized word sets using Sets for O(1) lookup
const SHENG_WORDS = new Set([
  // Greetings and casual expressions
  'niaje', 'sasa', 'mambo', 'vipi', 'poa', 'sawa', 'maze', 'msee', 'bro',
  // Money/Financial terms
  'dough', 'munde', 'ganji', 'bread', 'coins', 'chapaa', 'pesa', 'sina pesa',
  // Police/Authority terms  
  'karao', 'mse', 'sonko', 'kanjo',
  // Food terms
  'dishi', 'mlo', 'chakula',
  // Housing terms
  'kejani', 'base', 'place', 'crib', 'kuna',
  // Health terms
  'dokta', 'hosp', 'sick',
  // Work terms
  'hustle', 'job', 'kazi',
  // Transport terms
  'mat', 'basi', 'fare', 'mathree', 'stage',
  // Common Sheng expressions and verbs
  'cheki', 'jinga', 'ngoma', 'sort', 'connect', 'umeskia', 'niko', 'naeza',
  'dem', 'wasee', 'kitu', 'vitu', 'area', 'ndio', 'hapana', 'tutaonana',
  // Enhanced Sheng vocabulary
  'juu', 'chali', 'keki', 'ronga', 'beta', 'shafts', 'collo', 'morio', 'shimo', 'joints'
]);

const SWAHILI_WORDS = new Set([
  // Greetings and formal expressions
  'hujambo', 'habari', 'salamu', 'karibu', 'asante', 'pole', 'jambo',
  // Common verbs and expressions
  'nina', 'naweza', 'nataka', 'ninahitaji', 'ninaumwa', 'niko', 'sijui', 
  'ndiyo', 'hapana', 'nzuri', 'mbaya', 'vizuri', 'haraka', 'taratibu',
  // Nouns and daily life
  'chakula', 'nyumba', 'pesa', 'kazi', 'shule', 'daktari', 'polisi',
  'msaada', 'hali', 'mzuri', 'kidogo', 'kubwa', 'shida', 'furaha',
  // Personal pronouns and family
  'mimi', 'wewe', 'yeye', 'sisi', 'nyinyi', 'wao', 'familia', 'mama', 'baba',
  // Time and place
  'leo', 'kesho', 'jana', 'sasa', 'hapa', 'pale', 'mahali',
  // Actions and states
  'subiri', 'omba', 'fanya', 'enda', 'kuja', 'ona', 'sikia', 'elewa',
  // Enhanced formal Swahili
  'samahani', 'nimefurahi', 'nashukuru', 'tuonane', 'usalie', 'salama'
]);

const ENGLISH_WORDS = new Set([
  'help', 'problem', 'money', 'work', 'family', 'house', 'food', 'sick',
  'need', 'want', 'can', 'will', 'should', 'could', 'would', 'have',
  'good', 'bad', 'yes', 'no', 'please', 'thank', 'sorry', 'welcome'
]);

// Compiled regex patterns for better performance
const PATTERNS = {
  arabic: /[\u0600-\u06FF]/,
  shengGreeting: /^(niaje|sasa|mambo|vipi)|(\b(poa\s+sana|sina\s+pesa|umeskia|niko\s+poa)\b)|(\b(eh\s+bro|maze|msee)\b)|(\b(tutaonana|cheki\s+hii|sort\s+out)\b)/i,
  swahiliGreeting: /^(hujambo|habari|salamu)|(\b(asante\s+sana|karibu\s+sana|nzuri\s+sana)\b)|(\b(nimefurahi|samahani|pole\s+sana)\b)|(\b(usalie\s+salama|tuonane\s+kesho)\b)/i,
  mixedPatterns: /ni(ko|me|li)\s+(down|stressed|broke)|sina\s+(dough|munde|ganji)|nataka\s+(help|support)|niko\s+(place|area|base)|eh\s+(bro|maze)/i
};

/**
 * Enhanced language detection with confidence scoring and validation
 */
export const detectLanguage = (text: string): DetectionResult => {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }

  const lowerText = text.toLowerCase().trim();
  
  // Early return for Arabic
  if (PATTERNS.arabic.test(text)) {
    return {
      language: 'arabic',
      confidence: 0.95,
      hasCodeSwitching: false,
      detectedLanguages: ['arabic']
    };
  }
  
  const words = lowerText.split(/\s+/).filter(word => word.length > 0);
  const totalWords = Math.max(words.length, 1); // Prevent division by zero
  
  // Count matches using optimized Set lookups
  let shengMatches = 0;
  let swahiliMatches = 0;
  let englishMatches = 0;
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (SHENG_WORDS.has(cleanWord)) shengMatches++;
    if (SWAHILI_WORDS.has(cleanWord)) swahiliMatches++;
    if (ENGLISH_WORDS.has(cleanWord)) englishMatches++;
  });
  
  // Check for phrase patterns with higher weight
  let patternBonus = 0;
  if (PATTERNS.shengGreeting.test(text)) {
    shengMatches += 2;
    patternBonus = 0.2;
  }
  if (PATTERNS.swahiliGreeting.test(text)) {
    swahiliMatches += 2;
    patternBonus = 0.2;
  }
  if (PATTERNS.mixedPatterns.test(text)) {
    shengMatches += 1;
    patternBonus = 0.1;
  }
  
  // Calculate scores
  const shengScore = (shengMatches / totalWords) + patternBonus;
  const swahiliScore = swahiliMatches / totalWords;
  const englishScore = englishMatches / totalWords;
  
  // Determine detected languages for code-switching detection
  const detectedLanguages: string[] = [];
  if (shengScore > 0.1) detectedLanguages.push('sheng');
  if (swahiliScore > 0.1) detectedLanguages.push('swahili');
  if (englishScore > 0.1) detectedLanguages.push('english');
  
  // Language determination with confidence
  let primaryLanguage = 'english';
  let confidence = 0.3;
  
  if (shengScore > swahiliScore && shengScore > englishScore && shengScore > 0.2) {
    primaryLanguage = 'sheng';
    confidence = Math.min(0.95, shengScore + 0.2);
  } else if (swahiliScore > englishScore && swahiliScore > 0.15) {
    primaryLanguage = 'swahili';
    confidence = Math.min(0.9, swahiliScore + 0.1);
  } else if (englishScore > 0.1) {
    primaryLanguage = 'english';
    confidence = Math.min(0.8, englishScore + 0.1);
  }
  
  // If no clear language detected but we have some matches, default based on highest score
  if (detectedLanguages.length === 0) {
    if (shengMatches > 0 || swahiliMatches > 0) {
      detectedLanguages.push(shengMatches >= swahiliMatches ? 'sheng' : 'swahili');
      primaryLanguage = detectedLanguages[0];
      confidence = 0.4;
    } else {
      detectedLanguages.push('english');
    }
  }
  
  return {
    language: primaryLanguage,
    confidence,
    hasCodeSwitching: detectedLanguages.length > 1,
    detectedLanguages
  };
};

/**
 * Get supported languages with proper typing
 */
export const getSupportedLanguages = (): LanguageInfo[] => [
  { code: 'english', name: 'English', nativeName: 'English' },
  { code: 'swahili', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'sheng', name: 'Sheng', nativeName: 'Sheng' },
  { code: 'arabic', name: 'Arabic', nativeName: 'العربية' }
];

/**
 * Get contextual greeting based on time and language
 */
export const getContextualGreeting = (language: string): string => {
  const hour = new Date().getHours();
  
  const greetings: Record<string, Record<string, string>> = {
    sheng: {
      morning: 'Sasa! Mambo za asubuhi?',
      afternoon: 'Niaje! Vipi mchana?',
      evening: 'Mambo! Poa usiku?'
    },
    swahili: {
      morning: 'Habari za asubuhi?',
      afternoon: 'Habari za mchana?',
      evening: 'Habari za jioni?'
    },
    arabic: {
      morning: 'السلام عليكم',
      afternoon: 'السلام عليكم',
      evening: 'السلام عليكم'
    },
    english: {
      morning: 'Good morning!',
      afternoon: 'Good afternoon!',
      evening: 'Good evening!'
    }
  };
  
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const languageGreetings = greetings[language] || greetings.english;
  
  return languageGreetings[timeOfDay];
};

/**
 * Get culturally appropriate responses with enhanced error handling
 */
export const getCulturalResponse = (
  responseType: 'thanks' | 'goodbye' | 'help' | 'problem' | 'encouragement' | 'emergency', 
  language: string
): string => {
  const responses: Record<string, Record<string, string>> = {
    thanks: {
      sheng: 'Hakuna shida bro! Wakati wowote.',
      swahili: 'Hakuna tatizo. Karibu tena.',
      arabic: 'لا شكر على واجب',
      english: "You're welcome! Anytime."
    },
    goodbye: {
      sheng: 'Sawa maze, tutaonana! Jisort.',
      swahili: 'Haya, tutaonana. Usalie salama.',
      arabic: 'مع السلامة',
      english: 'Take care! See you later.'
    },
    help: {
      sheng: 'Sawa bro, nina haraka kukusaidia. Ni nini unauliza?',
      swahili: 'Haya, nitakusaidia. Ni nini unahitaji?',
      arabic: 'بالطبع، كيف يمكنني مساعدتك؟',
      english: 'Of course! How can I help you?'
    },
    problem: {
      sheng: 'Pole sana bro, tutasolve hiyo issue. Niambie zaidi.',
      swahili: 'Pole sana kwa hiyo tatizo. Niambie ni nini kimehappen.',
      arabic: 'آسف لهذه المشكلة، أخبريني المزيد',
      english: "I'm sorry to hear about this problem. Tell me more."
    },
    encouragement: {
      sheng: 'Usijali bro, kila kitu kitakuwa poa. Stay strong!',
      swahili: 'Usiogope, mambo yatakuwa mazuri. Uwe na nguvu.',
      arabic: 'لا تقلق، كل شيء سيكون بخير',
      english: "Don't worry, everything will be okay. Stay strong!"
    },
    emergency: {
      sheng: 'Okay bro, nimeelewa ni emergency. Haraka nikuhelp!',
      swahili: 'Sawa, nimeelewa ni dharura. Nitakusaidia haraka.',
      arabic: 'فهمت، هذه حالة طارئة. سأساعدك فورًا',
      english: 'I understand this is an emergency. Let me help you right away!'
    }
  };
  
  const responseCategory = responses[responseType];
  if (!responseCategory) {
    return responses.help.english; // Fallback to help in English
  }
  
  return responseCategory[language] || responseCategory.english;
};

/**
 * Enhanced emotional state detection with intensity levels
 */
export const detectEmotionalState = (text: string, language: string): EmotionalContext => {
  const lowerText = text.toLowerCase();
  
  const emotionalMarkers: Record<string, Record<string, string[]>> = {
    distressed: {
      sheng: [
        'niko down', 'sina dough', 'sina chapaa', 'shida kubwa', 'najiskia vibaya', 
        'stressed sana', 'nimebreak', 'sina pesa', 'nina stress', 'umeniangusha',
        'niko desperate', 'sina mahali', 'nimelose hope'
      ],
      swahili: [
        'nina shida', 'nina hofu', 'nimechoka', 'nina stress', 'hali mbaya', 
        'nimejam', 'sijui la kufanya', 'nimehuzunika', 'nina wasiwasi',
        'nimepoteza tumaini', 'sina msaada', 'nina tatizo kubwa'
      ],
      english: [
        'stressed', 'overwhelmed', 'desperate', 'scared', 'worried', 'broke', 
        'depressed', 'lost hope', 'no money', 'can\'t cope', 'breaking down'
      ],
      arabic: ['قلقان', 'خائف', 'متوتر', 'محبط', 'يائس', 'مفلس']
    },
    urgent: {
      sheng: [
        'emergency', 'dharura', 'nina haraka', 'urgent sana', 'immediately',
        'haraka sana', 'nina emergency', 'help haraka', 'msaada wa haraka'
      ],
      swahili: [
        'dharura', 'haraka sana', 'tatizo kubwa', 'msaada wa haraka',
        'hali ya dharura', 'nina haja ya haraka', 'sitaweza kusubiri'
      ],
      english: [
        'urgent', 'emergency', 'immediately', 'help', 'crisis', 'asap',
        'right now', 'can\'t wait', 'desperate need'
      ],
      arabic: ['عاجل', 'طوارئ', 'بسرعة', 'مساعدة فورية', 'حالة طارئة']
    },
    grateful: {
      sheng: [
        'asante sana bro', 'poa sana', 'umesaidia', 'thanks maze', 'much love',
        'nimefurahi sana', 'umehelp sana', 'amazing bro'
      ],
      swahili: [
        'asante', 'nashukuru', 'nimefurahi', 'baraka', 'mungu akubariki',
        'umesaidia sana', 'sina maneno', 'umeongeza furaha'
      ],
      english: [
        'thank', 'grateful', 'appreciate', 'blessing', 'amazing',
        'you helped', 'so happy', 'much better'
      ],
      arabic: ['شكرا', 'ممتن', 'الله يعطيك العافية', 'بارك الله فيك']
    }
  };
  
  const checkEmotionalMarkers = (category: string): { found: boolean; markers: string[]; intensity: 'low' | 'medium' | 'high' } => {
    const categoryMarkers = emotionalMarkers[category];
    const languageMarkers = categoryMarkers[language] || categoryMarkers.english || [];
    const foundMarkers = languageMarkers.filter(marker => 
      lowerText.includes(marker.toLowerCase())
    );
    
    let intensity: 'low' | 'medium' | 'high' = 'low';
    if (foundMarkers.length > 2) intensity = 'high';
    else if (foundMarkers.length > 0) intensity = 'medium';
    
    return {
      found: foundMarkers.length > 0,
      markers: foundMarkers,
      intensity
    };
  };
  
  // Check in priority order
  const urgentCheck = checkEmotionalMarkers('urgent');
  if (urgentCheck.found) {
    return {
      state: 'urgent',
      intensity: urgentCheck.intensity,
      culturalMarkers: urgentCheck.markers
    };
  }
  
  const distressedCheck = checkEmotionalMarkers('distressed');
  if (distressedCheck.found) {
    return {
      state: 'distressed',
      intensity: distressedCheck.intensity,
      culturalMarkers: distressedCheck.markers
    };
  }
  
  const gratefulCheck = checkEmotionalMarkers('grateful');
  if (gratefulCheck.found) {
    return {
      state: 'grateful',
      intensity: gratefulCheck.intensity,
      culturalMarkers: gratefulCheck.markers
    };
  }
  
  return {
    state: 'neutral',
    intensity: 'low',
    culturalMarkers: []
  };
};

/**
 * Enhanced response style determination
 */
export const getResponseStyle = (text: string, detectedLanguage: string): 'formal' | 'casual' | 'mixed' => {
  const detection = detectLanguage(text);
  
  if (detection.hasCodeSwitching) return 'mixed';
  if (detectedLanguage === 'sheng') return 'casual';
  if (detectedLanguage === 'swahili') return 'formal';
  
  return 'casual';
};

/**
 * Utility functions with proper validation
 */
export const getLanguageDisplayName = (languageCode: string): string => {
  if (!languageCode || typeof languageCode !== 'string') return 'Unknown';
  
  const language = getSupportedLanguages().find(lang => lang.code === languageCode.toLowerCase());
  return language ? language.nativeName : languageCode;
};

export const isLanguageSupported = (languageCode: string): boolean => {
  if (!languageCode || typeof languageCode !== 'string') return false;
  
  return getSupportedLanguages().some(lang => lang.code === languageCode.toLowerCase());
};

/**
 * Get comprehensive response context for a given text
 */
export const getResponseContext = (text: string): ResponseContext => {
  const detection = detectLanguage(text);
  const emotionalState = detectEmotionalState(text, detection.language);
  const style = getResponseStyle(text, detection.language);
  const timeBasedGreeting = getContextualGreeting(detection.language);
  
  return {
    style,
    emotionalState,
    timeBasedGreeting
  };
};

/**
 * Generate enhanced response based on context
 */
export const generateContextualResponse = (
  userMessage: string, 
  responseType: 'thanks' | 'goodbye' | 'help' | 'problem' | 'encouragement' | 'emergency',
  targetLanguage?: string
): string => {
  const detection = detectLanguage(userMessage);
  const language = targetLanguage || detection.language;
  const emotionalContext = detectEmotionalState(userMessage, language);
  
  let baseResponse = getCulturalResponse(responseType, language);
  
  // Enhance based on emotional intensity
  if (emotionalContext.intensity === 'high') {
    const intensityModifiers: Record<string, string> = {
      sheng: ' Pole sana bro, tutasort hii.',
      swahili: ' Pole sana, nitakusaidia kabisa.',
      english: ' I really understand, let me help you.',
      arabic: ' أفهم تماماً، دعني أساعدك'
    };
    baseResponse += intensityModifiers[language] || intensityModifiers.english;
  }
  
  return baseResponse;
};

// Basic translation function
export const translateText = (text: string, targetLanguage: string): string => {
  // Simple implementation - in a real app, this would use a translation service
  return text;
};

// Add missing exports for compatibility
export const getEnhancedTranslation = (text: string, lang: string): string => {
  return translateText(text, lang);
};

export const enhanceResponseWithEmotion = (text: string, context: string): string => {
  return text; // Basic implementation
};