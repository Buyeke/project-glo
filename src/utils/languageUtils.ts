
// Simple language detection utility
export const detectLanguage = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  // Arabic detection - check for Arabic characters
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'arabic';
  }
  
  // Swahili/Sheng detection - common words and patterns
  const swahiliWords = ['nina', 'naweza', 'nataka', 'ninahitaji', 'ninaumwa', 'niko', 'sijui', 'ndiyo', 'hapana', 'asante', 'karibu', 'jambo', 'habari'];
  const shengWords = ['naeza', 'napenda', 'niaje', 'poa', 'sawa', 'uko', 'place', 'sort', 'connect'];
  
  const words = lowerText.split(' ');
  
  const swahiliMatches = words.filter(word => swahiliWords.includes(word)).length;
  const shengMatches = words.filter(word => shengWords.includes(word)).length;
  
  if (swahiliMatches > 0 && swahiliMatches >= shengMatches) {
    return 'swahili';
  } else if (shengMatches > 0) {
    return 'sheng';
  }
  
  // Default to English
  return 'english';
};

export const getSupportedLanguages = () => [
  { code: 'english', name: 'English', nativeName: 'English' },
  { code: 'swahili', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'arabic', name: 'Arabic', nativeName: 'العربية' },
  { code: 'sheng', name: 'Sheng', nativeName: 'Sheng' }
];
