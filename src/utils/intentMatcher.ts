interface Intent {
  id: string;
  category: string;
  intent_key: string;
  keywords: Record<string, string[]>;
  response_template: Record<string, string>;
}

interface Service {
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

export const matchIntent = (message: string, intents: Intent[], language: string = 'english'): { intent: Intent | null; confidence: number } => {
  const lowerMessage = message.toLowerCase().trim();
  let bestMatch: Intent | null = null;
  let bestScore = 0;
  
  console.log('Matching message:', lowerMessage, 'in language:', language);
  console.log('Available intents:', intents.length);
  
  for (const intent of intents) {
    // Get keywords for the detected language, with fallbacks
    let keywords = intent.keywords[language] || intent.keywords['english'] || [];
    
    // If language is Sheng, also include some Swahili keywords for better matching
    if (language === 'sheng' && intent.keywords['swahili']) {
      keywords = [...keywords, ...intent.keywords['swahili']];
    }
    
    let matchCount = 0;
    let totalKeywords = keywords.length;
    let emotionalBoost = 0;
    let languageBoost = 0;
    
    console.log(`Checking intent ${intent.intent_key} with keywords:`, keywords);
    
    // Enhanced matching logic for Sheng and multilingual support
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // Direct match
      if (lowerMessage.includes(lowerKeyword)) {
        matchCount++;
        console.log(`Matched keyword: ${keyword}`);
        
        // Give emotional boost for vulnerable expressions
        if (isEmotionalKeyword(lowerKeyword)) {
          emotionalBoost += 0.2;
        }
        
        // Boost for exact phrase matches
        if (lowerKeyword.includes(' ') && lowerMessage.includes(lowerKeyword)) {
          emotionalBoost += 0.1;
        }
        
        // Language-specific boost
        if (language === 'sheng' && isShengKeyword(lowerKeyword)) {
          languageBoost += 0.1;
        }
      } else {
        // Enhanced partial matching for mixed languages
        const messageWords = lowerMessage.split(/\s+/);
        const keywordWords = lowerKeyword.split(/\s+/);
        
        for (const msgWord of messageWords) {
          for (const keyWord of keywordWords) {
            // Fuzzy matching for similar words
            if (msgWord.length > 2 && keyWord.length > 2) {
              if (msgWord.includes(keyWord) || keyWord.includes(msgWord) || 
                  levenshteinDistance(msgWord, keyWord) <= 1) {
                matchCount += 0.5;
                console.log(`Partial match: ${msgWord} ~= ${keyWord}`);
                break;
              }
            }
          }
        }
      }
    }
    
    // Calculate confidence score with enhanced context
    let confidence = totalKeywords > 0 ? matchCount / totalKeywords : 0;
    confidence = Math.min(confidence + emotionalBoost + languageBoost, 1.0);
    
    console.log(`Intent ${intent.intent_key} confidence: ${confidence} (${matchCount}/${totalKeywords}) + emotional: ${emotionalBoost} + language: ${languageBoost}`);
    
    // Prioritize emergency intents
    if (intent.category === 'emergency' && confidence > 0.3) {
      confidence += 0.2;
    }
    
    // Boost for exact language match
    if (intent.intent_key.includes(language) && confidence > 0.2) {
      confidence += 0.15;
    }
    
    // Lower threshold for better matching
    if (confidence > bestScore && matchCount > 0) {
      bestScore = confidence;
      bestMatch = intent;
    }
  }
  
  console.log('Best match:', bestMatch?.intent_key, 'with confidence:', bestScore);
  
  return {
    intent: bestMatch,
    confidence: bestScore
  };
};

// Helper function to identify emotional keywords
const isEmotionalKeyword = (keyword: string): boolean => {
  const emotionalWords = [
    'scared', 'afraid', 'overwhelmed', 'stressed', 'anxious', 'depressed',
    'cold', 'hungry', 'starving', 'tired', 'lost', 'alone', 'help',
    'ninaogopa', 'nina hofu', 'nimechoka', 'nina stress', 'niko down',
    'baridi', 'njaa', 'nina njaa', 'nisaidie', 'msaada'
  ];
  
  return emotionalWords.some(word => keyword.includes(word));
};

// Helper function to identify Sheng-specific keywords
const isShengKeyword = (keyword: string): boolean => {
  const shengWords = [
    'karao', 'mse', 'sonko', 'kanjo', 'dough', 'munde', 'ganji', 'bread', 'coins',
    'dishi', 'mlo', 'kejani', 'base', 'crib', 'dokta', 'hosp', 'hustle', 'mat',
    'basi', 'msee', 'dem', 'wasee', 'poa', 'sawa', 'niaje', 'naeza'
  ];
  
  return shengWords.some(word => keyword.includes(word));
};

// Simple Levenshtein distance function for fuzzy matching
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

export const matchService = (message: string, services: Service[]): Service[] => {
  const lowerMessage = message.toLowerCase().trim();
  const scoredServices: { service: Service; score: number }[] = [];
  
  console.log('Matching services for message:', lowerMessage);
  console.log('Available services:', services.length);

  for (const service of services) {
    let score = 0;
    
    // Define keywords for each service category and title
    const serviceKeywords = [
      ...service.title.toLowerCase().split(' '),
      ...service.category.toLowerCase().split(' '),
      ...(service.description?.toLowerCase().split(' ') || [])
    ];

    // Add specific keywords based on service type with emotional context
    const additionalKeywords = getServiceKeywords(service.category.toLowerCase(), service.title.toLowerCase());
    serviceKeywords.push(...additionalKeywords);

    console.log(`Checking service ${service.title} with keywords:`, serviceKeywords);

    // Enhanced scoring with emotional context
    for (const keyword of serviceKeywords) {
      if (keyword.length > 2) {
        if (lowerMessage.includes(keyword)) {
          let keywordScore = keyword.length > 4 ? 2 : 1;
          
          // Emotional boost for vulnerable keywords
          if (isEmotionalKeyword(keyword)) {
            keywordScore += 1;
          }
          
          score += keywordScore;
          console.log(`Matched keyword "${keyword}" for service ${service.title} (score: ${keywordScore})`);
        }
      }
    }

    // Priority boosting for emergency and basic needs
    if (service.category.toLowerCase().includes('emergency') || 
        service.priority_level === 'Urgent') {
      score += 3;
    }

    // Boost for exact category matches
    if (lowerMessage.includes(service.category.toLowerCase())) {
      score += 2;
    }

    if (score > 0) {
      scoredServices.push({ service, score });
      console.log(`Service ${service.title} scored: ${score}`);
    }
  }

  // Sort by score and return top 3
  const sortedServices = scoredServices
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.service);

  console.log('Top matched services:', sortedServices.map(s => ({ title: s.title, category: s.category })));
  
  return sortedServices;
};

const getServiceKeywords = (category: string, title: string): string[] => {
  const keywords: string[] = [];

  // Emergency/Shelter keywords with emotional context
  if (category.includes('emergency') || title.includes('shelter') || category.includes('basic')) {
    keywords.push(
      'shelter', 'housing', 'accommodation', 'emergency', 'safe', 'place to stay', 
      'homeless', 'cold', 'nowhere to go', 'sleep tonight',
      'makazi', 'nyumba', 'mahali pa kulala', 'baridi', 'sina pa kulala',
      'base', 'place ya kulala', 'kulala'
    );
  }

  // Healthcare keywords with emotional/family context
  if (category.includes('healthcare') || title.includes('health') || category.includes('medical')) {
    keywords.push(
      'doctor', 'hospital', 'medical', 'health', 'clinic', 'treatment', 'sick', 
      'pregnant', 'child sick', 'pain', 'medicine',
      'daktari', 'hospitali', 'afya', 'matibabu', 'mgonjwa', 'mjamzito', 
      'mtoto mgonjwa', 'maumivu', 'dawa',
      'doki', 'sick', 'medical', 'clinic'
    );
  }

  // Food keywords with desperation indicators
  if (category.includes('basic') || title.includes('food') || category.includes('nutrition')) {
    keywords.push(
      'food', 'hungry', 'starving', 'eat', 'meal', 'nutrition', 'nothing to eat',
      'no money for food', 'feed my children',
      'chakula', 'njaa', 'nina njaa', 'kula', 'mlo', 'sina chakula', 
      'sina pesa ya chakula', 'kulisha watoto',
      'food', 'njaa', 'dishi', 'starve'
    );
  }

  // Legal keywords
  if (category.includes('legal') || title.includes('legal')) {
    keywords.push(
      'legal', 'lawyer', 'court', 'law', 'rights', 'advocate', 'family law',
      'wakili', 'sheria', 'mahakama'
    );
  }

  // Employment keywords with family support context
  if (category.includes('employment') || title.includes('job') || category.includes('work')) {
    keywords.push(
      'job', 'work', 'employment', 'training', 'skills', 'career', 'income',
      'support my family', 'CV', 'interview',
      'kazi', 'ajira', 'mapato', 'mafunzo', 'kusaidia familia',
      'job', 'work', 'income', 'pesa', 'hustle'
    );
  }

  // Mental health keywords
  if (category.includes('mental') || title.includes('counseling') || title.includes('support')) {
    keywords.push(
      'overwhelmed', 'depressed', 'anxious', 'stressed', 'counseling', 'therapy',
      'need someone to talk', 'mental health',
      'nimechoka', 'nina stress', 'hali mbaya', 'nahitaji mtu wa kuongea',
      'niko down', 'stressed', 'need kuongea'
    );
  }

  return keywords;
};

// Enhanced fallback response with better Sheng support
export const getFallbackResponse = (language: string): string => {
  const responses = {
    english: "I'm here to help you, and I want to make sure I understand what you need. Could you tell me a bit more? I can assist with shelter, food, healthcare, job support, or just someone to talk to. You're not alone in this.",
    swahili: "Niko hapa kukusaidia, na nataka kuhakikisha naelewa unachohitaji. Unaweza kuniambia zaidi? Naweza kusaidia na makazi, chakula, afya, msaada wa kazi, au mtu wa kuongea naye. Haumo peke yako.",
    sheng: "Niko hapa kukusaidia, bro. Nataka kuelewa unachohitaji. Unaweza niambie zaidi? Naeza help na kejani, dishi, health, job opportunities, ama mtu wa kuongea. Haumo peke yako kwa hii.",
    arabic: "أنا هنا لمساعدتك، وأريد أن أتأكد من فهمي لما تحتاجينه. هل يمكنك إخباري أكثر؟ يمكنني المساعدة في المأوى والطعام والرعاية الصحية ودعم العمل أو مجرد شخص للحديث معه. لست وحدك."
  };
  
  return responses[language as keyof typeof responses] || responses.english;
};

// Enhanced translation function placeholder
export const translateText = async (text: string, fromLang: string, toLang: string): Promise<string> => {
  console.log(`Translation requested: ${text} from ${fromLang} to ${toLang}`);
  
  // For now, return the original text
  // In production, integrate with LibreTranslate API or similar service
  return text;
};
