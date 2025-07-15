
// Enhanced language detection utility with comprehensive Sheng and Swahili support
export const detectLanguage = (text: string): string => {
  const lowerText = text.toLowerCase().trim();
  
  // Arabic detection - check for Arabic characters
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'arabic';
  }
  
  // Enhanced Sheng detection - comprehensive street slang patterns
  const shengWords = [
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
    'mat', 'basi', 'fare',
    // Common Sheng expressions and verbs
    'cheki', 'jinga', 'ngoma', 'sort', 'connect', 'umeskia', 'niko', 'naeza',
    'dem', 'wasee', 'kitu', 'vitu', 'area', 'ndio', 'hapana', 'tutaonana',
    // Enhanced Sheng vocabulary
    'juu', 'chali', 'dem', 'keki', 'ronga', 'beta', 'shafts', 'collo',
    'mathree', 'stage', 'fare', 'kanjo', 'morio', 'shimo', 'joints'
  ];
  
  // Comprehensive Swahili words - formal and standard
  const swahiliWords = [
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
  ];
  
  const words = lowerText.split(/\s+/);
  
  // Enhanced matching with phrase detection
  const shengMatches = words.filter(word => 
    shengWords.some(shengWord => 
      word.includes(shengWord) || shengWord.includes(word) || 
      lowerText.includes(shengWord)
    )
  ).length;
  
  const swahiliMatches = words.filter(word => 
    swahiliWords.some(swahiliWord => 
      word.includes(swahiliWord) || swahiliWord.includes(word) ||
      lowerText.includes(swahiliWord)
    )
  ).length;
  
  // Enhanced scoring system with phrase detection
  const totalWords = words.length;
  const shengScore = shengMatches / totalWords;
  const swahiliScore = swahiliMatches / totalWords;
  
  // Check for specific Sheng greeting patterns
  const shengGreetingPatterns = [
    /^(niaje|sasa|mambo|vipi)/i,
    /\b(poa\s+sana|sina\s+pesa|umeskia|niko\s+poa)\b/i,
    /\b(eh\s+bro|maze|msee)\b/i,
    /\b(tutaonana|cheki\s+hii|sort\s+out)\b/i
  ];
  
  // Check for formal Swahili patterns
  const swahiliGreetingPatterns = [
    /^(hujambo|habari|salamu)/i,
    /\b(asante\s+sana|karibu\s+sana|nzuri\s+sana)\b/i,
    /\b(nimefurahi|samahani|pole\s+sana)\b/i,
    /\b(usalie\s+salama|tuonane\s+kesho)\b/i
  ];
  
  // Pattern-based detection
  if (shengGreetingPatterns.some(pattern => pattern.test(text))) {
    return 'sheng';
  }
  
  if (swahiliGreetingPatterns.some(pattern => pattern.test(text))) {
    return 'swahili';
  }
  
  // If we have strong Sheng indicators, return Sheng
  if (shengScore > 0.3 || (shengMatches > 0 && shengScore >= swahiliScore)) {
    return 'sheng';
  } else if (swahiliScore > 0.2 || swahiliMatches > 0) {
    return 'swahili';
  }
  
  // Check for mixed language patterns common in Sheng
  const mixedPatterns = [
    /ni(ko|me|li)\s+(down|stressed|broke)/i,
    /sina\s+(dough|munde|ganji)/i,
    /nataka\s+(help|support)/i,
    /niko\s+(place|area|base)/i,
    /eh\s+(bro|maze)/i
  ];
  
  if (mixedPatterns.some(pattern => pattern.test(text))) {
    return 'sheng';
  }
  
  // Default to English
  return 'english';
};

export const getSupportedLanguages = () => [
  { code: 'english', name: 'English', nativeName: 'English' },
  { code: 'swahili', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'sheng', name: 'Sheng', nativeName: 'Sheng' },
  { code: 'arabic', name: 'Arabic', nativeName: 'العربية' }
];

// Helper function to get appropriate greeting based on time and language
export const getContextualGreeting = (language: string): string => {
  const hour = new Date().getHours();
  
  switch (language) {
    case 'sheng':
      if (hour < 12) return 'Sasa! Mambo za asubuhi?';
      if (hour < 17) return 'Niaje! Vipi mchana?';
      return 'Mambo! Poa usiku?';
    
    case 'swahili':
      if (hour < 12) return 'Habari za asubuhi?';
      if (hour < 17) return 'Habari za mchana?';
      return 'Habari za jioni?';
    
    case 'arabic':
      return 'السلام عليكم';
    
    default:
      if (hour < 12) return 'Good morning!';
      if (hour < 17) return 'Good afternoon!';
      return 'Good evening!';
  }
};

// Helper function to get culturally appropriate responses
export const getCulturalResponse = (responseType: 'thanks' | 'goodbye' | 'help' | 'problem', language: string): string => {
  const responses = {
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
    }
  };
  
  return responses[responseType][language as keyof typeof responses[typeof responseType]] || responses[responseType].english;
};

// Helper function to get language display name
export const getLanguageDisplayName = (languageCode: string): string => {
  const language = getSupportedLanguages().find(lang => lang.code === languageCode);
  return language ? language.nativeName : languageCode;
};

// Helper function to check if a language is supported
export const isLanguageSupported = (languageCode: string): boolean => {
  return getSupportedLanguages().some(lang => lang.code === languageCode);
};

// Helper function to detect emotional state from text
export const detectEmotionalState = (text: string, language: string): 'distressed' | 'grateful' | 'urgent' | 'neutral' => {
  const lowerText = text.toLowerCase();
  
  const distressWords = {
    sheng: ['niko down', 'sina pesa', 'shida kubwa', 'najiskia vibaya', 'stressed sana', 'nimebreak', 'sina dough'],
    swahili: ['nina shida', 'nina hofu', 'nimechoka', 'nina stress', 'hali mbaya', 'nimejam', 'sijui la kufanya'],
    english: ['stressed', 'overwhelmed', 'desperate', 'scared', 'worried', 'broke', 'depressed'],
    arabic: ['قلقان', 'خائف', 'متوتر', 'محبط']
  };
  
  const urgentWords = {
    sheng: ['haraka', 'emergency', 'dharura', 'nina haraka', 'urgent sana', 'immediately'],
    swahili: ['dharura', 'haraka sana', 'tatizo kubwa', 'msaada wa haraka'],
    english: ['urgent', 'emergency', 'immediately', 'help', 'crisis'],
    arabic: ['عاجل', 'طوارئ', 'بسرعة', 'مساعدة فورية']
  };
  
  const gratefulWords = {
    sheng: ['asante sana', 'poa sana', 'umesaidia', 'thanks bro', 'much love'],
    swahili: ['asante', 'nashukuru', 'nimefurahi', 'baraka', 'mungu akubariki'],
    english: ['thank', 'grateful', 'appreciate', 'blessing', 'amazing'],
    arabic: ['شكرا', 'ممتن', 'الله يعطيك العافية']
  };
  
  const checkWords = (wordList: string[]) => 
    wordList.some(word => lowerText.includes(word));
  
  if (checkWords(distressWords[language as keyof typeof distressWords] || [])) {
    return 'distressed';
  }
  if (checkWords(urgentWords[language as keyof typeof urgentWords] || [])) {
    return 'urgent';
  }
  if (checkWords(gratefulWords[language as keyof typeof gratefulWords] || [])) {
    return 'grateful';
  }
  
  return 'neutral';
};

// Enhanced code-switching detection
export const detectCodeSwitching = (text: string): { hasCodeSwitching: boolean; languages: string[] } => {
  const detectedLanguages: string[] = [];
  const words = text.toLowerCase().split(/\s+/);
  
  // Check for English words
  const englishWords = ['help', 'problem', 'money', 'work', 'family', 'house', 'food', 'sick'];
  if (englishWords.some(word => words.includes(word))) {
    detectedLanguages.push('english');
  }
  
  // Check for Sheng words
  const shengWords = ['poa', 'sawa', 'maze', 'msee', 'dough', 'cheki', 'niaje'];
  if (shengWords.some(word => words.some(w => w.includes(word)))) {
    detectedLanguages.push('sheng');
  }
  
  // Check for Swahili words
  const swahiliWords = ['nina', 'asante', 'habari', 'karibu', 'pole', 'haraka'];
  if (swahiliWords.some(word => words.some(w => w.includes(word)))) {
    detectedLanguages.push('swahili');
  }
  
  return {
    hasCodeSwitching: detectedLanguages.length > 1,
    languages: detectedLanguages
  };
};

// Helper to get appropriate response style based on detected mixing
export const getResponseStyle = (text: string, detectedLanguage: string): 'formal' | 'casual' | 'mixed' => {
  const { hasCodeSwitching } = detectCodeSwitching(text);
  
  if (hasCodeSwitching) return 'mixed';
  if (detectedLanguage === 'sheng') return 'casual';
  if (detectedLanguage === 'swahili') return 'formal';
  
  return 'casual';
};
