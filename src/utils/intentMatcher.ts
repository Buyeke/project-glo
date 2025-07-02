
interface Intent {
  id: string;
  category: string;
  intent_key: string;
  keywords: Record<string, string[]>;
  response_template: Record<string, string>;
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
