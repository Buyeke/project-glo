
import { detectLanguage, getContextualGreeting, getCulturalResponse, detectEmotionalState } from './languageUtils';

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
    // Get keywords for the detected language, with cultural fallbacks
    let keywords = intent.keywords[language] || intent.keywords['english'] || [];
    
    // Enhanced language fallback system
    if (language === 'sheng') {
      // Sheng can understand Swahili and some English
      keywords = [
        ...keywords, 
        ...(intent.keywords['swahili'] || []),
        ...(intent.keywords['english'] || []).filter(word => isCommonEnglishInSheng(word))
      ];
    } else if (language === 'swahili' && intent.keywords['sheng']) {
      // Swahili speakers might use some Sheng
      keywords = [...keywords, ...intent.keywords['sheng']];
    }
    
    let matchCount = 0;
    let totalKeywords = keywords.length;
    let emotionalBoost = 0;
    let culturalBoost = 0;
    let contextBoost = 0;
    
    console.log(`Checking intent ${intent.intent_key} with keywords:`, keywords);
    
    // Enhanced matching logic with cultural context
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // Direct phrase matching (prioritized)
      if (lowerMessage.includes(lowerKeyword)) {
        let matchScore = 1;
        
        // Boost for exact phrase matches
        if (lowerKeyword.includes(' ') && lowerMessage.includes(lowerKeyword)) {
          matchScore += 0.5;
        }
        
        // Cultural context boost
        if (isCulturalKeyword(lowerKeyword, language)) {
          culturalBoost += 0.2;
        }
        
        // Emotional urgency boost
        if (isEmotionalKeyword(lowerKeyword)) {
          emotionalBoost += 0.3;
        }
        
        // Language-specific boost
        if (language === 'sheng' && isShengKeyword(lowerKeyword)) {
          culturalBoost += 0.15;
        }
        
        matchCount += matchScore;
        console.log(`Matched keyword: ${keyword} (score: ${matchScore})`);
      } else {
        // Enhanced fuzzy matching with cultural variations
        const messageWords = lowerMessage.split(/\s+/);
        const keywordWords = lowerKeyword.split(/\s+/);
        
        for (const msgWord of messageWords) {
          for (const keyWord of keywordWords) {
            if (msgWord.length > 2 && keyWord.length > 2) {
              // Fuzzy matching for similar words
              if (msgWord.includes(keyWord) || keyWord.includes(msgWord) || 
                  levenshteinDistance(msgWord, keyWord) <= 1 ||
                  areCulturalVariants(msgWord, keyWord, language)) {
                matchCount += 0.6;
                console.log(`Fuzzy match: ${msgWord} ~= ${keyWord}`);
                break;
              }
            }
          }
        }
      }
    }
    
    // Detect emotional state and apply context boost
    const emotionalState = detectEmotionalState(lowerMessage, language);
    if (emotionalState.state === 'urgent' && intent.category === 'emergency') {
      contextBoost += 0.4;
    } else if (emotionalState.state === 'distressed' && intent.category === 'emotional_support') {
      contextBoost += 0.3;
    }
    
    // Calculate enhanced confidence score
    let confidence = totalKeywords > 0 ? matchCount / totalKeywords : 0;
    confidence = Math.min(confidence + emotionalBoost + culturalBoost + contextBoost, 1.0);
    
    console.log(`Intent ${intent.intent_key} confidence: ${confidence} (${matchCount}/${totalKeywords}) + emotional: ${emotionalBoost} + cultural: ${culturalBoost} + context: ${contextBoost}`);
    
    // Enhanced priority system
    if (intent.category === 'emergency' && confidence > 0.2) {
      confidence += 0.3;
    } else if (intent.category === 'basic_service' && confidence > 0.3) {
      confidence += 0.2;
    }
    
    // Language match bonus
    if (intent.intent_key.includes(language) && confidence > 0.2) {
      confidence += 0.15;
    }
    
    // Lower threshold for culturally relevant matches
    if (confidence > bestScore && (matchCount > 0 || emotionalBoost > 0)) {
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

// Enhanced helper functions for cultural awareness
const isCommonEnglishInSheng = (word: string): boolean => {
  const commonEnglishInSheng = [
    'help', 'money', 'food', 'house', 'job', 'work', 'sick', 'doctor',
    'police', 'emergency', 'problem', 'support', 'family', 'children'
  ];
  return commonEnglishInSheng.some(w => word.toLowerCase().includes(w));
};

const isCulturalKeyword = (keyword: string, language: string): boolean => {
  const culturalKeywords = {
    sheng: ['maze', 'msee', 'bro', 'poa', 'sawa', 'cheki', 'sort'],
    swahili: ['pole', 'karibu', 'asante', 'habari', 'haraka', 'subiri'],
    english: ['family', 'community', 'support', 'help'],
    arabic: ['السلام', 'شكرا', 'مساعدة']
  };
  
  return culturalKeywords[language as keyof typeof culturalKeywords]?.some(w => keyword.includes(w)) || false;
};

const areCulturalVariants = (word1: string, word2: string, language: string): boolean => {
  const variants = {
    sheng: [
      ['pesa', 'dough', 'munde', 'chapaa'],
      ['sawa', 'poa', 'fresh'],
      ['msee', 'maze', 'bro'],
      ['shida', 'stress', 'problem']
    ],
    swahili: [
      ['chakula', 'mlo'],
      ['nyumba', 'makazi'],
      ['daktari', 'mganga'],
      ['pesa', 'fedha']
    ]
  };
  
  const langVariants = variants[language as keyof typeof variants] || [];
  return langVariants.some(group => 
    group.includes(word1) && group.includes(word2)
  );
};

// Helper function to identify emotional keywords
const isEmotionalKeyword = (keyword: string): boolean => {
  const emotionalWords = [
    'scared', 'afraid', 'overwhelmed', 'stressed', 'anxious', 'depressed',
    'cold', 'hungry', 'starving', 'tired', 'lost', 'alone', 'help',
    'ninaogopa', 'nina hofu', 'nimechoka', 'nina stress', 'niko down',
    'baridi', 'njaa', 'nina njaa', 'nisaidie', 'msaada', 'shida kubwa',
    'sina pesa', 'sina chakula', 'nimejam', 'najiskia vibaya'
  ];
  
  return emotionalWords.some(word => keyword.includes(word));
};

// Helper function to identify Sheng-specific keywords
const isShengKeyword = (keyword: string): boolean => {
  const shengWords = [
    'karao', 'mse', 'sonko', 'kanjo', 'dough', 'munde', 'ganji', 'bread', 'coins',
    'dishi', 'mlo', 'kejani', 'base', 'crib', 'dokta', 'hosp', 'hustle', 'mat',
    'basi', 'msee', 'dem', 'wasee', 'poa', 'sawa', 'niaje', 'naeza', 'vipi',
    'mambo', 'sasa', 'cheki', 'sort', 'connect', 'maze', 'bro'
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
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

export const matchService = (message: string, services: Service[]): Service[] => {
  const lowerMessage = message.toLowerCase().trim();
  const scoredServices: { service: Service; score: number }[] = [];
  const detectedLangResult = detectLanguage(message);
  const detectedLang = typeof detectedLangResult === 'string' ? detectedLangResult : detectedLangResult.language;
  
  console.log('Matching services for message:', lowerMessage, 'in language:', detectedLang);
  console.log('Available services:', services.length);

  for (const service of services) {
    let score = 0;
    
    // Enhanced service keywords with cultural context
    const serviceKeywords = [
      ...service.title.toLowerCase().split(' '),
      ...service.category.toLowerCase().split(' '),
      ...(service.description?.toLowerCase().split(' ') || [])
    ];

    // Add culturally-aware keywords
    const culturalKeywords = getServiceKeywords(
      service.category.toLowerCase(), 
      service.title.toLowerCase(),
      detectedLang
    );
    serviceKeywords.push(...culturalKeywords);

    console.log(`Checking service ${service.title} with keywords:`, serviceKeywords);

    // Enhanced scoring with cultural and emotional context
    for (const keyword of serviceKeywords) {
      if (keyword.length > 2) {
        if (lowerMessage.includes(keyword)) {
          let keywordScore = keyword.length > 4 ? 2 : 1;
          
          // Cultural relevance boost
          if (isCulturalKeyword(keyword, detectedLang)) {
            keywordScore += 1;
          }
          
          // Emotional urgency boost
          if (isEmotionalKeyword(keyword)) {
            keywordScore += 1.5;
          }
          
          score += keywordScore;
          console.log(`Matched keyword "${keyword}" for service ${service.title} (score: ${keywordScore})`);
        }
      }
    }

    // Enhanced priority system
    const emotionalState = detectEmotionalState(lowerMessage, detectedLang);
    
    if (emotionalState.state === 'urgent' && (
      service.category.toLowerCase().includes('emergency') || 
      service.priority_level === 'Urgent'
    )) {
      score += 5;
    } else if (emotionalState.state === 'distressed' && (
      service.category.toLowerCase().includes('mental') ||
      service.title.toLowerCase().includes('counseling')
    )) {
      score += 4;
    }

    // Basic needs priority for distressed users
    if (emotionalState.state === 'distressed' && service.category.toLowerCase().includes('basic')) {
      score += 3;
    }

    // Language support bonus
    if (service.language_support?.toLowerCase().includes(detectedLang)) {
      score += 2;
    }

    // Exact category match bonus
    if (lowerMessage.includes(service.category.toLowerCase())) {
      score += 3;
    }

    if (score > 0) {
      scoredServices.push({ service, score });
      console.log(`Service ${service.title} scored: ${score}`);
    }
  }

  // Sort by score and return top matches
  const sortedServices = scoredServices
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.service);

  console.log('Top matched services:', sortedServices.map(s => ({ title: s.title, category: s.category })));
  
  return sortedServices;
};

const getServiceKeywords = (category: string, title: string, language: string): string[] => {
  const keywords: string[] = [];

  // Emergency/Shelter keywords with cultural context
  if (category.includes('emergency') || title.includes('shelter') || category.includes('basic')) {
    switch (language) {
      case 'sheng':
        keywords.push(
          'kejani', 'base', 'place ya kulala', 'sina mahali', 'baridi sana',
          'emergency', 'dharura', 'shelter', 'kulala', 'place'
        );
        break;
      case 'swahili':
        keywords.push(
          'makazi', 'nyumba', 'mahali pa kulala', 'sina pa kulala', 'baridi',
          'dharura', 'msaada wa haraka', 'makazi ya dharura'
        );
        break;
      default:
        keywords.push(
          'shelter', 'housing', 'accommodation', 'emergency', 'safe', 
          'place to stay', 'homeless', 'cold', 'nowhere to go'
        );
    }
  }

  // Healthcare keywords with cultural context
  if (category.includes('healthcare') || title.includes('health') || category.includes('medical')) {
    switch (language) {
      case 'sheng':
        keywords.push(
          'doki', 'sick', 'medical', 'clinic', 'hospital', 'mgonjwa',
          'nina shida ya health', 'nataka treatment'
        );
        break;
      case 'swahili':
        keywords.push(
          'daktari', 'hospitali', 'afya', 'matibabu', 'mgonjwa', 'mjamzito',
          'mtoto mgonjwa', 'maumivu', 'dawa', 'zahanati'
        );
        break;
      default:
        keywords.push(
          'doctor', 'hospital', 'medical', 'health', 'clinic', 'treatment',
          'sick', 'pregnant', 'child sick', 'pain', 'medicine'
        );
    }
  }

  // Food keywords with urgency indicators
  if (category.includes('basic') || title.includes('food') || category.includes('nutrition')) {
    switch (language) {
      case 'sheng':
        keywords.push(
          'njaa', 'dishi', 'food', 'sina food', 'starve', 'hungry',
          'sina pesa ya food', 'watoto wana njaa'
        );
        break;
      case 'swahili':
        keywords.push(
          'chakula', 'njaa', 'nina njaa', 'kula', 'mlo', 'sina chakula',
          'sina pesa ya chakula', 'kulisha watoto', 'njaa kuu'
        );
        break;
      default:
        keywords.push(
          'food', 'hungry', 'starving', 'eat', 'meal', 'nutrition',
          'nothing to eat', 'no money for food', 'feed my children'
        );
    }
  }

  // Mental health keywords with cultural sensitivity
  if (category.includes('mental') || title.includes('counseling') || title.includes('support')) {
    switch (language) {
      case 'sheng':
        keywords.push(
          'niko down', 'stressed', 'need kuongea', 'mental health',
          'najiskia vibaya', 'nina stress kubwa'
        );
        break;
      case 'swahili':
        keywords.push(
          'nimechoka', 'nina stress', 'hali mbaya', 'nahitaji mtu wa kuongea',
          'ushauri', 'msaada wa kihisia', 'kupumzika'
        );
        break;
      default:
        keywords.push(
          'overwhelmed', 'depressed', 'anxious', 'stressed', 'counseling',
          'therapy', 'need someone to talk', 'mental health'
        );
    }
  }

  return keywords;
};

// Enhanced fallback response with cultural awareness
export const getFallbackResponse = (language: string): string => {
  const responses = {
    english: "I'm here to help you, and I want to make sure I understand what you need. Could you tell me a bit more? I can assist with shelter, food, healthcare, job support, or just someone to talk to. You're not alone in this.",
    
    swahili: "Niko hapa kukusaidia, na nataka kuhakikisha naelewa unachohitaji. Unaweza kuniambia zaidi? Naweza kusaidia na makazi, chakula, afya, msaada wa kazi, au mtu wa kuongea naye. Haumo peke yako katika hili.",
    
    sheng: "Eh bro, niko hapa kukusaidia. Nataka kuelewa vizuri unachohitaji. Unaweza niambie zaidi? Naeza help na kejani, dishi, health issues, job opportunities, ama tu mtu wa kuongea. Haumo solo kwa hii journey.",
    
    arabic: "أنا هنا لمساعدتك، وأريد أن أتأكد من فهمي لما تحتاجينه. هل يمكنك إخباري أكثر؟ يمكنني المساعدة في المأوى والطعام والرعاية الصحية ودعم العمل أو مجرد شخص للحديث معه. لست وحدك في هذا."
  };
  
  return responses[language as keyof typeof responses] || responses.english;
};

// Enhanced translation function placeholder with cultural context
export const translateText = async (text: string, fromLang: string, toLang: string): Promise<string> => {
  console.log(`Translation requested: ${text} from ${fromLang} to ${toLang}`);
  
  // For now, return the original text with cultural note
  // In production, integrate with culturally-aware translation service
  return text;
};
