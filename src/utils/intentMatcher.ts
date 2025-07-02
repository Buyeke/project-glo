
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
    const keywords = intent.keywords[language] || intent.keywords['english'] || [];
    let matchCount = 0;
    let totalKeywords = keywords.length;
    
    console.log(`Checking intent ${intent.intent_key} with keywords:`, keywords);
    
    // Check for keyword matches with partial matching
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // Check for exact word match, partial match, or contained match
      if (lowerMessage.includes(lowerKeyword) || 
          lowerMessage.split(' ').some(word => word.includes(lowerKeyword)) ||
          lowerKeyword.split(' ').some(word => lowerMessage.includes(word))) {
        matchCount++;
        console.log(`Matched keyword: ${keyword}`);
      }
    }
    
    // Calculate confidence score
    const confidence = totalKeywords > 0 ? matchCount / totalKeywords : 0;
    console.log(`Intent ${intent.intent_key} confidence: ${confidence} (${matchCount}/${totalKeywords})`);
    
    // Lower threshold for better matching and consider any match
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

    // Add specific keywords based on service type
    const additionalKeywords = getServiceKeywords(service.category.toLowerCase(), service.title.toLowerCase());
    serviceKeywords.push(...additionalKeywords);

    console.log(`Checking service ${service.title} with keywords:`, serviceKeywords);

    // Score based on keyword matches
    for (const keyword of serviceKeywords) {
      if (keyword.length > 2) { // Skip very short words
        if (lowerMessage.includes(keyword)) {
          score += keyword.length > 4 ? 2 : 1; // Give more weight to longer keywords
          console.log(`Matched keyword "${keyword}" for service ${service.title}`);
        }
      }
    }

    // Boost score for exact category matches
    if (lowerMessage.includes(service.category.toLowerCase())) {
      score += 3;
    }

    // Boost score for exact title matches
    if (lowerMessage.includes(service.title.toLowerCase())) {
      score += 5;
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

  // Emergency/Shelter keywords
  if (category.includes('emergency') || title.includes('shelter')) {
    keywords.push('shelter', 'housing', 'accommodation', 'emergency', 'safe', 'place to stay', 'homeless', 'makazi', 'nyumba');
  }

  // Healthcare keywords  
  if (category.includes('healthcare') || title.includes('health')) {
    keywords.push('doctor', 'hospital', 'medical', 'health', 'clinic', 'treatment', 'daktari', 'hospitali', 'afya', 'matibabu');
  }

  // Food keywords
  if (category.includes('basic') || title.includes('food')) {
    keywords.push('food', 'hungry', 'eat', 'meal', 'nutrition', 'chakula', 'njaa', 'kula');
  }

  // Legal keywords
  if (category.includes('legal') || title.includes('legal')) {
    keywords.push('legal', 'lawyer', 'court', 'law', 'rights', 'advocate', 'wakili', 'sheria');
  }

  // Employment keywords
  if (category.includes('employment') || title.includes('job')) {
    keywords.push('job', 'work', 'employment', 'training', 'skills', 'career', 'kazi', 'ajira');
  }

  return keywords;
};

export const getFallbackResponse = (language: string): string => {
  const responses = {
    english: "Sorry, I didn't understand that. Can you try rephrasing or use the menu options? I can help with shelter, food, healthcare, emergency situations, and more.",
    swahili: "Samahani, sikuelewa hilo. Je, unaweza kurudia kwa njia nyingine au tumia chaguo za menyu? Naweza kusaidia na makazi, chakula, afya, hali za dharura, na mengine.",
    arabic: "آسف، لم أفهم ذلك. هل يمكنك إعادة الصياغة أو استخدام خيارات القائمة؟ يمكنني المساعدة في المأوى والطعام والرعاية الصحية وحالات الطوارئ والمزيد.",
    sheng: "Pole, sikuelewa hiyo. Unaweza sema tena au tumia menu options? Naeza kusaidia na shelter, food, healthcare, emergency situations, na vitu zingine."
  };
  
  return responses[language as keyof typeof responses] || responses.english;
};

// Simple translation function (placeholder for LibreTranslate integration)
export const translateText = async (text: string, fromLang: string, toLang: string): Promise<string> => {
  // For now, return the original text
  // In production, you would integrate with LibreTranslate API
  console.log(`Translation requested: ${text} from ${fromLang} to ${toLang}`);
  return text;
};
