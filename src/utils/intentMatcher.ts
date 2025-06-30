
interface Intent {
  id: string;
  category: string;
  intent_key: string;
  keywords: Record<string, string[]>;
  response_template: Record<string, string>;
}

export const matchIntent = (message: string, intents: Intent[], language: string = 'english'): { intent: Intent | null; confidence: number } => {
  const lowerMessage = message.toLowerCase();
  let bestMatch: Intent | null = null;
  let bestScore = 0;
  
  for (const intent of intents) {
    const keywords = intent.keywords[language] || intent.keywords['english'] || [];
    let score = 0;
    
    // Check for keyword matches
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    // Normalize score by number of keywords
    const normalizedScore = keywords.length > 0 ? score / keywords.length : 0;
    
    if (normalizedScore > bestScore && normalizedScore > 0.3) { // Minimum confidence threshold
      bestScore = normalizedScore;
      bestMatch = intent;
    }
  }
  
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
