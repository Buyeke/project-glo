
// Enhanced language detection utility with improved Sheng support
export const detectLanguage = (text: string): string => {
  const lowerText = text.toLowerCase().trim();
  
  // Arabic detection - check for Arabic characters
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'arabic';
  }
  
  // Enhanced Sheng detection - common words and patterns
  const shengWords = [
    // Money/Financial terms
    'dough', 'munde', 'ganji', 'bread', 'coins',
    // Police/Authority terms  
    'karao', 'mse', 'sonko', 'kanjo',
    // Food terms
    'dishi', 'mlo',
    // Housing terms
    'kejani', 'base', 'place', 'crib',
    // Health terms
    'dokta', 'hosp',
    // Work terms
    'hustle', 'job', 'kazi',
    // Transport terms
    'mat', 'basi', 'fare',
    // Common Sheng expressions
    'naeza', 'napenda', 'niaje', 'poa', 'sawa', 'uko', 'sort', 'connect',
    'bro', 'msee', 'dem', 'wasee', 'kitu', 'vitu', 'place', 'area'
  ];
  
  // Swahili words - more comprehensive list
  const swahiliWords = [
    'nina', 'naweza', 'nataka', 'ninahitaji', 'ninaumwa', 'niko', 'sijui', 
    'ndiyo', 'hapana', 'asante', 'karibu', 'jambo', 'habari', 'pole',
    'chakula', 'nyumba', 'pesa', 'kazi', 'shule', 'daktari', 'polisi',
    'msaada', 'hali', 'sawa', 'mzuri', 'mbaya', 'kidogo', 'kubwa',
    'mimi', 'wewe', 'yeye', 'sisi', 'nyinyi', 'wao'
  ];
  
  const words = lowerText.split(/\s+/);
  
  const shengMatches = words.filter(word => 
    shengWords.some(shengWord => 
      word.includes(shengWord) || shengWord.includes(word)
    )
  ).length;
  
  const swahiliMatches = words.filter(word => 
    swahiliWords.some(swahiliWord => 
      word.includes(swahiliWord) || swahiliWord.includes(word)
    )
  ).length;
  
  // Enhanced scoring system
  const totalWords = words.length;
  const shengScore = shengMatches / totalWords;
  const swahiliScore = swahiliMatches / totalWords;
  
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
    /niko\s+(place|area|base)/i
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

// Helper function to get language display name
export const getLanguageDisplayName = (languageCode: string): string => {
  const language = getSupportedLanguages().find(lang => lang.code === languageCode);
  return language ? language.nativeName : languageCode;
};

// Helper function to check if a language is supported
export const isLanguageSupported = (languageCode: string): boolean => {
  return getSupportedLanguages().some(lang => lang.code === languageCode);
};
