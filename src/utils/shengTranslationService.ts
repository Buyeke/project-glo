
// Enhanced Sheng translation service with real-world examples
export interface TranslationExample {
  sheng: string;
  swahili: string;
  english: string;
  context: 'greeting' | 'money' | 'food' | 'transport' | 'work' | 'emotion' | 'tech' | 'expression' | 'complex' | 'advice' | 'business' | 'weather';
  formality: 'casual' | 'formal' | 'mixed';
}

export const translationExamples: TranslationExample[] = [
  // Greetings & Basic Interactions
  { sheng: "niaje bro", swahili: "hujambo rafiki", english: "hello friend", context: 'greeting', formality: 'casual' },
  { sheng: "sasa, poa?", swahili: "habari, hujambo?", english: "what's up, how are you?", context: 'greeting', formality: 'casual' },
  { sheng: "mambo vipi", swahili: "habari gani", english: "how are things", context: 'greeting', formality: 'casual' },
  { sheng: "niko poa sana", swahili: "niko mzuri sana", english: "i'm doing very well", context: 'greeting', formality: 'casual' },
  { sheng: "tutaonana baadaye", swahili: "tutaonana baadaye", english: "see you later", context: 'greeting', formality: 'casual' },

  // Money & Shopping
  { sheng: "sina dough kabisa", swahili: "sina pesa kabisa", english: "i don't have any money at all", context: 'money', formality: 'casual' },
  { sheng: "bei ni ngapi", swahili: "bei ni ngapi", english: "how much does it cost", context: 'money', formality: 'formal' },
  { sheng: "hiyo ni ghali sana", swahili: "hiyo ni ghali sana", english: "that's very expensive", context: 'money', formality: 'mixed' },
  { sheng: "punguza kidogo", swahili: "punguza kidogo", english: "reduce it a little", context: 'money', formality: 'mixed' },
  { sheng: "nina chapaa za kutosha", swahili: "nina pesa za kutosha", english: "i have enough money", context: 'money', formality: 'casual' },

  // Food & Drinks
  { sheng: "niletee chai", swahili: "niletee chai", english: "bring me tea", context: 'food', formality: 'casual' },
  { sheng: "hii nyama ni fresh", swahili: "hii nyama ni mpya", english: "this meat is fresh", context: 'food', formality: 'casual' },
  { sheng: "niko na njaa sana", swahili: "nina njaa sana", english: "i'm very hungry", context: 'food', formality: 'casual' },
  { sheng: "niuzie mandazi", swahili: "niuzie mandazi", english: "sell me mandazi", context: 'food', formality: 'casual' },
  { sheng: "hiyo chakula ni tamu", swahili: "hiyo chakula ni tamu", english: "that food is delicious", context: 'food', formality: 'mixed' },

  // Transportation
  { sheng: "matatu imejaa", swahili: "matatu imejaa", english: "the matatu is full", context: 'transport', formality: 'casual' },
  { sheng: "nishuke hapa", swahili: "nishuke hapa", english: "let me get off here", context: 'transport', formality: 'casual' },
  { sheng: "gari imevunjika", swahili: "gari imevunjika", english: "the car is broken", context: 'transport', formality: 'mixed' },
  { sheng: "twende haraka", swahili: "twende haraka", english: "let's go quickly", context: 'transport', formality: 'mixed' },
  { sheng: "songa kidogo", swahili: "songa kidogo", english: "move a little", context: 'transport', formality: 'casual' },

  // Work & School
  { sheng: "kazi ni ngumu", swahili: "kazi ni ngumu", english: "work is hard", context: 'work', formality: 'mixed' },
  { sheng: "niko late", swahili: "nimechelewa", english: "i'm late", context: 'work', formality: 'casual' },
  { sheng: "prof ni msumbufu", swahili: "profesa ni msumbufu", english: "the professor is annoying", context: 'work', formality: 'casual' },
  { sheng: "exam ni ngumu", swahili: "mtihani ni mgumu", english: "the exam is difficult", context: 'work', formality: 'casual' },
  { sheng: "nimefinish assignment", swahili: "nimemaliza kazi ya nyumbani", english: "i've finished the assignment", context: 'work', formality: 'casual' },

  // Emotions & Reactions
  { sheng: "niko down sana", swahili: "nimehuzunika sana", english: "i'm very sad", context: 'emotion', formality: 'casual' },
  { sheng: "hiyo ni poa", swahili: "hiyo ni nzuri", english: "that's cool", context: 'emotion', formality: 'casual' },
  { sheng: "umeniangusha", swahili: "umenisikitisha", english: "you've disappointed me", context: 'emotion', formality: 'casual' },
  { sheng: "niko happy sana", swahili: "nimefurahi sana", english: "i'm very happy", context: 'emotion', formality: 'casual' },
  { sheng: "si unajua ni stress", swahili: "unajua ni msongo wa mawazo", english: "you know it's stressful", context: 'emotion', formality: 'casual' },

  // Technology & Communication
  { sheng: "simu imedie", swahili: "simu imeharibika", english: "the phone is dead", context: 'tech', formality: 'casual' },
  { sheng: "nitumie message", swahili: "nitumie ujumbe", english: "send me a message", context: 'tech', formality: 'casual' },
  { sheng: "wifi haiwork", swahili: "wifi haifanyi kazi", english: "wifi doesn't work", context: 'tech', formality: 'casual' },
  { sheng: "nipe number yako", swahili: "nipe nambari yako", english: "give me your number", context: 'tech', formality: 'casual' },
  { sheng: "ni-add kwa whatsapp", swahili: "niongeze kwa whatsapp", english: "add me on whatsapp", context: 'tech', formality: 'casual' },

  // Common Expressions
  { sheng: "hakuna shida", swahili: "hakuna tatizo", english: "no problem", context: 'expression', formality: 'mixed' },
  { sheng: "umeskia", swahili: "umeelewa", english: "do you understand", context: 'expression', formality: 'casual' },
  { sheng: "pole sana", swahili: "pole sana", english: "sorry", context: 'expression', formality: 'formal' },
  { sheng: "jinga kidogo", swahili: "kuwa mwangalifu", english: "be careful", context: 'expression', formality: 'casual' },
  { sheng: "achana na hiyo", swahili: "acha hiyo", english: "leave that alone", context: 'expression', formality: 'casual' },

  // Business & Formal
  { sheng: "biashara inafanya poa", swahili: "biashara inafanya vizuri", english: "business is doing well", context: 'business', formality: 'mixed' },
  { sheng: "nipe discount kidogo", swahili: "nipe punguzo kidogo", english: "give me a small discount", context: 'business', formality: 'casual' },
  { sheng: "hii ni quality goods", swahili: "hii ni bidhaa za ubora", english: "these are quality goods", context: 'business', formality: 'mixed' },
  { sheng: "wateja ni wengi leo", swahili: "wateja ni wengi leo", english: "there are many customers today", context: 'business', formality: 'formal' },
  { sheng: "tumia mpesa", swahili: "tumia mpesa", english: "use m-pesa", context: 'business', formality: 'mixed' },

  // Weather & Time
  { sheng: "jua ni kali sana", swahili: "jua ni kali sana", english: "the sun is very hot", context: 'weather', formality: 'mixed' },
  { sheng: "ni late sana", swahili: "ni usiku sana", english: "it's very late", context: 'weather', formality: 'casual' },
  { sheng: "mvua inanyesha", swahili: "mvua inanyesha", english: "it's raining", context: 'weather', formality: 'mixed' },
  { sheng: "morning ni baridi", swahili: "asubuhi ni baridi", english: "the morning is cold", context: 'weather', formality: 'casual' },
  { sheng: "saa ngapi sasa", swahili: "saa ngapi sasa", english: "what time is it now", context: 'weather', formality: 'mixed' }
];

export const findBestTranslation = (text: string, fromLang: string, toLang: string): string | null => {
  const lowerText = text.toLowerCase().trim();
  
  // Find exact matches first
  for (const example of translationExamples) {
    const sourceText = example[fromLang as keyof typeof example] as string;
    if (sourceText && sourceText.toLowerCase() === lowerText) {
      return example[toLang as keyof typeof example] as string;
    }
  }
  
  // Find partial matches
  for (const example of translationExamples) {
    const sourceText = example[fromLang as keyof typeof example] as string;
    if (sourceText && (
      lowerText.includes(sourceText.toLowerCase()) || 
      sourceText.toLowerCase().includes(lowerText)
    )) {
      return example[toLang as keyof typeof example] as string;
    }
  }
  
  return null;
};

export const getContextualFormality = (text: string): 'casual' | 'formal' | 'mixed' => {
  const lowerText = text.toLowerCase();
  
  // Formal indicators
  const formalIndicators = ['asante', 'karibu', 'hujambo', 'samahani', 'nashukuru'];
  const casualIndicators = ['bro', 'maze', 'poa', 'sawa', 'niaje', 'vipi'];
  
  const hasFormal = formalIndicators.some(word => lowerText.includes(word));
  const hasCasual = casualIndicators.some(word => lowerText.includes(word));
  
  if (hasFormal && hasCasual) return 'mixed';
  if (hasFormal) return 'formal';
  if (hasCasual) return 'casual';
  
  return 'mixed';
};

export const enhanceTranslationWithContext = (translation: string, context: string, formality: 'casual' | 'formal' | 'mixed'): string => {
  // Add cultural context and appropriate formality
  const contextEnhancers = {
    greeting: {
      casual: (text: string) => text,
      formal: (text: string) => text.replace(/bro|maze/g, 'rafiki'),
      mixed: (text: string) => text
    },
    money: {
      casual: (text: string) => text,
      formal: (text: string) => text.replace(/dough|chapaa/g, 'pesa'),
      mixed: (text: string) => text
    },
    emotion: {
      casual: (text: string) => text,
      formal: (text: string) => text.replace(/down/g, 'huzunika'),
      mixed: (text: string) => text
    }
  };
  
  const enhancer = contextEnhancers[context as keyof typeof contextEnhancers];
  if (enhancer && enhancer[formality]) {
    return enhancer[formality](translation);
  }
  
  return translation;
};
