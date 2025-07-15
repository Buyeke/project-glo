
import { translationExamples, findBestTranslation, enhanceTranslationWithContext } from './shengTranslationService';
import { detectLanguageWithContext } from './enhancedLanguageDetection';

export interface CulturalResponse {
  text: string;
  language: string;
  formality: 'casual' | 'formal' | 'mixed';
  culturalNotes?: string[];
}

export const generateCulturalResponse = (
  userMessage: string,
  responseType: 'thanks' | 'goodbye' | 'help' | 'problem' | 'encouragement' | 'emergency',
  targetLanguage?: string
): CulturalResponse => {
  
  const detection = detectLanguageWithContext(userMessage);
  const language = targetLanguage || detection.language;
  const formality = detection.formality;
  
  const responses = {
    thanks: {
      sheng: {
        casual: 'Hakuna shida bro! Wakati wowote. Niko hapa.',
        formal: 'Karibu sana. Nitakusaidia daima.',
        mixed: 'Hakuna shida rafiki! Niko hapa wakati wowote.'
      },
      swahili: {
        casual: 'Hakuna tatizo. Karibu tena.',
        formal: 'Asante, hakuna tatizo. Karibu daima.',
        mixed: 'Hakuna shida. Karibu tena rafiki.'
      },
      english: {
        casual: "You're welcome! Anytime.",
        formal: "You're very welcome. I'm always here to help.",
        mixed: "You're welcome! Always happy to help."
      },
      arabic: {
        casual: 'لا شكر على واجب',
        formal: 'لا شكر على واجب، أنا هنا دائماً',
        mixed: 'لا شكر على واجب'
      }
    },
    goodbye: {
      sheng: {
        casual: 'Sawa maze, tutaonana! Jisort.',
        formal: 'Haya, tutaonana. Usalie salama.',
        mixed: 'Sawa bro, tutaonana baadaye!'
      },
      swahili: {
        casual: 'Haya, tutaonana.',
        formal: 'Haya, tutaonana. Usalie salama.',
        mixed: 'Tutaonana baadaye. Usalie salama.'
      },
      english: {
        casual: 'Take care! See you later.',
        formal: 'Take care of yourself. Until we meet again.',
        mixed: 'Take care! See you soon.'
      },
      arabic: {
        casual: 'مع السلامة',
        formal: 'مع السلامة، الله معك',
        mixed: 'مع السلامة'
      }
    },
    help: {
      sheng: {
        casual: 'Sawa bro, nina haraka kukusaidia. Ni nini unauliza?',
        formal: 'Nitakusaidia. Ni nini unahitaji?',
        mixed: 'Poa, nitakusaidia. Niambie unachohitaji?'
      },
      swahili: {
        casual: 'Nitakusaidia. Ni nini unahitaji?',
        formal: 'Bila shaka, nitakusaidia. Niambie unachohitaji.',
        mixed: 'Haya, nitakusaidia. Ni nini unachohitaji?'
      },
      english: {
        casual: 'Of course! How can I help you?',
        formal: 'Certainly. How may I assist you today?',
        mixed: 'Sure! What do you need help with?'
      },
      arabic: {
        casual: 'بالطبع، كيف يمكنني مساعدتك؟',
        formal: 'بالتأكيد، كيف يمكنني مساعدتك اليوم؟',
        mixed: 'طبعاً، كيف أساعدك؟'
      }
    },
    problem: {
      sheng: {
        casual: 'Pole sana bro, tutasolve hiyo issue. Niambie zaidi.',
        formal: 'Samahani kwa hiyo tatizo. Niambie ni nini kimehappen.',
        mixed: 'Pole sana rafiki. Tutamaliza hiyo shida. Niambie zaidi.'
      },
      swahili: {
        casual: 'Pole sana kwa hiyo tatizo.',
        formal: 'Samahani sana kwa hiyo tatizo. Niambie ni nini kimehappen.',
        mixed: 'Pole sana. Niambie kuhusu hiyo shida.'
      },
      english: {
        casual: "I'm sorry to hear about this problem.",
        formal: "I sincerely apologize for this issue. Please tell me more.",
        mixed: "I'm sorry about that. Tell me more about the problem."
      },
      arabic: {
        casual: 'آسف لهذه المشكلة',
        formal: 'أعتذر بشدة لهذه المشكلة، أخبريني المزيد',
        mixed: 'آسف لهذا، أخبريني أكثر'
      }
    },
    encouragement: {
      sheng: {
        casual: 'Bro, utapona. Haumo peke yako kwa hii. Tuko pamoja.',
        formal: 'Tutakusaidia kupita katika hali hii. Haumo peke yako.',
        mixed: 'Maze, utaovercome hii. Tuko pamoja kwa journey hii.'
      },
      swahili: {
        casual: 'Utapona. Haumo peke yako.',
        formal: 'Tutakusaidia kupita katika hali hii. Mungu yupo.',
        mixed: 'Utaovercome hii. Tuko pamoja.'
      },
      english: {
        casual: "You're going to get through this. You're not alone.",
        formal: "You will overcome this challenge. You have our full support.",
        mixed: "You can get through this. We're here with you."
      },
      arabic: {
        casual: 'ستتجاوزين هذا الأمر. لست وحدك.',
        formal: 'ستتجاوزين هذا التحدي بإذن الله. نحن معك.',
        mixed: 'ستتجاوزين هذا. نحن هنا معك.'
      }
    },
    emergency: {
      sheng: {
        casual: 'Emergency bro! Niko hapa kukusaidia haraka. Niambie location.',
        formal: 'Hii ni dharura. Nitakusaidia mara moja. Niambie mahali ulipo.',
        mixed: 'Emergency! Nitakusaidia haraka sana. Niambie location yako.'
      },
      swahili: {
        casual: 'Hii ni dharura! Nitakusaidia haraka.',
        formal: 'Hii ni dharura kubwa. Nitakusaidia mara moja.',
        mixed: 'Dharura! Nitakusaidia haraka sana.'
      },
      english: {
        casual: 'This is an emergency! I will help you right away.',
        formal: 'This is an emergency situation. I will provide immediate assistance.',
        mixed: 'Emergency! I\'ll help you immediately.'
      },
      arabic: {
        casual: 'هذه حالة طوارئ! سأساعدك فوراً.',
        formal: 'هذه حالة طوارئ، سأقدم المساعدة الفورية.',
        mixed: 'طوارئ! سأساعدك حالاً.'
      }
    }
  };
  
  const responseGroup = responses[responseType];
  const languageResponses = responseGroup[language as keyof typeof responseGroup] || responseGroup.english;
  const response = languageResponses[formality];
  
  // Add cultural notes for context
  const culturalNotes: string[] = [];
  
  if (language === 'sheng' && formality === 'casual') {
    culturalNotes.push('Using casual Sheng with friendly terms like "bro" and "maze"');
  } else if (language === 'swahili' && formality === 'formal') {
    culturalNotes.push('Using formal Swahili showing respect and cultural politeness');
  } else if (formality === 'mixed') {
    culturalNotes.push('Code-switching between languages for natural conversation');
  }
  
  return {
    text: response,
    language,
    formality,
    culturalNotes
  };
};

// Function to adapt response based on emotional context
export const adaptResponseToEmotion = (
  baseResponse: string,
  emotionalState: string,
  language: string,
  formality: 'casual' | 'formal' | 'mixed'
): string => {
  
  const emotionalAdaptations = {
    urgent: {
      sheng: {
        casual: (text: string) => `Emergency bro! ${text}`,
        formal: (text: string) => `Hii ni dharura. ${text}`,
        mixed: (text: string) => `Emergency! ${text}`
      },
      swahili: {
        casual: (text: string) => `Dharura! ${text}`,
        formal: (text: string) => `Hii ni dharura kubwa. ${text}`,
        mixed: (text: string) => `Dharura! ${text}`
      },
      english: {
        casual: (text: string) => `Emergency! ${text}`,
        formal: (text: string) => `This is urgent. ${text}`,
        mixed: (text: string) => `Emergency! ${text}`
      }
    },
    distressed: {
      sheng: {
        casual: (text: string) => `Pole sana bro. ${text} Tutakusaidia.`,
        formal: (text: string) => `Pole sana. ${text}`,
        mixed: (text: string) => `Pole sana rafiki. ${text}`
      },
      swahili: {
        casual: (text: string) => `Pole sana. ${text}`,
        formal: (text: string) => `Samahani sana kwa hali hii. ${text}`,
        mixed: (text: string) => `Pole sana. ${text}`
      },
      english: {
        casual: (text: string) => `I'm so sorry. ${text}`,
        formal: (text: string) => `I sincerely sympathize. ${text}`,
        mixed: (text: string) => `I'm sorry. ${text}`
      }
    }
  };
  
  const adaptation = emotionalAdaptations[emotionalState as keyof typeof emotionalAdaptations];
  if (adaptation && adaptation[language as keyof typeof adaptation]) {
    const langAdaptation = adaptation[language as keyof typeof adaptation];
    return langAdaptation[formality](baseResponse);
  }
  
  return baseResponse;
};
