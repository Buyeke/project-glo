
// Enhanced Sheng intent matcher for trauma-informed chatbot
interface ShengIntent {
  sheng: string;
  meaning: string;
  intent: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: 'emergency' | 'shelter' | 'medical' | 'legal' | 'mental_health' | 'financial' | 'employment' | 'education' | 'support';
}

export const shengIntents: ShengIntent[] = [
  // Critical/Emergency situations
  { sheng: "nimebanwa", meaning: "I'm in a tough situation", intent: "needs help urgently", urgency: 'critical', category: 'emergency' },
  { sheng: "kupigwa na msee", meaning: "I was abused", intent: "needs legal or medical support", urgency: 'critical', category: 'legal' },
  { sheng: "nimepotea", meaning: "I'm lost / I have nowhere to go", intent: "needs shelter", urgency: 'critical', category: 'shelter' },
  { sheng: "nimechoka na life", meaning: "I'm tired of life", intent: "mental health crisis", urgency: 'critical', category: 'mental_health' },
  { sheng: "nataka kujitoa", meaning: "I'm thinking of ending my life", intent: "suicide crisis", urgency: 'critical', category: 'mental_health' },
  { sheng: "nimefukuzwa", meaning: "I've been kicked out", intent: "needs shelter urgently", urgency: 'critical', category: 'shelter' },
  { sheng: "niko kwa matope", meaning: "I'm in deep trouble", intent: "needs urgent help", urgency: 'critical', category: 'emergency' },
  { sheng: "nimepigwa vibaya", meaning: "I was beaten badly", intent: "needs medical or legal help", urgency: 'critical', category: 'medical' },
  { sheng: "nataka kuhepa", meaning: "I want to run away (from abuse)", intent: "needs safety planning", urgency: 'critical', category: 'legal' },
  { sheng: "nimefungiwa kwa room", meaning: "I've been locked in", intent: "needs rescue", urgency: 'critical', category: 'emergency' },
  { sheng: "niko kwa lockdown ya msee", meaning: "I'm being controlled/isolated", intent: "needs safety and support", urgency: 'critical', category: 'legal' },
  { sheng: "sina mahali pa kulala", meaning: "I have nowhere to sleep", intent: "needs emergency shelter", urgency: 'critical', category: 'shelter' },
  { sheng: "msee amenitishia", meaning: "Someone threatened me", intent: "needs protection or legal help", urgency: 'critical', category: 'legal' },
  { sheng: "nimebebwa na police", meaning: "I was arrested or taken by police", intent: "needs legal aid", urgency: 'critical', category: 'legal' },
  { sheng: "nimebebwa kwa nguvu", meaning: "I was assaulted", intent: "needs legal and trauma support", urgency: 'critical', category: 'legal' },

  // High priority situations  
  { sheng: "niko na ball ya force", meaning: "I was forced into pregnancy", intent: "needs medical and legal aid", urgency: 'high', category: 'medical' },
  { sheng: "nataka safe house", meaning: "I want a safe shelter", intent: "needs shelter urgently", urgency: 'high', category: 'shelter' },
  { sheng: "niko na case court", meaning: "I have a court case", intent: "needs legal advice", urgency: 'high', category: 'legal' },
  { sheng: "nimeambukizwa", meaning: "I've been infected", intent: "needs medical help", urgency: 'high', category: 'medical' },
  { sheng: "niko na stress ya ball", meaning: "I'm stressed about pregnancy", intent: "maternal mental health support", urgency: 'high', category: 'mental_health' },
  { sheng: "mtoi wangu ameumwa", meaning: "My child is sick", intent: "needs pediatric medical care", urgency: 'high', category: 'medical' },
  { sheng: "nimeshindwa kabisa", meaning: "I'm completely stuck/defeated", intent: "needs emotional or practical support", urgency: 'high', category: 'support' },
  { sheng: "nimerogwa vibaya", meaning: "I'm very sick", intent: "needs medical attention", urgency: 'high', category: 'medical' },
  { sheng: "nimejamba na stress", meaning: "I'm overwhelmed with stress", intent: "needs mental health support", urgency: 'high', category: 'mental_health' },
  { sheng: "siezi handle hii situation", meaning: "I can't handle this situation", intent: "needs crisis intervention", urgency: 'high', category: 'emergency' },
  { sheng: "nimebaki bila hope", meaning: "I'm left without hope", intent: "needs suicide prevention support", urgency: 'high', category: 'mental_health' },
  { sheng: "nimepatikana na ugonjwa mbaya", meaning: "I've been diagnosed with a serious illness", intent: "needs medical and emotional support", urgency: 'high', category: 'medical' },
  { sheng: "nimechukuliwa advantage", meaning: "I've been taken advantage of", intent: "needs protection services", urgency: 'high', category: 'legal' },
  { sheng: "nimekamatwa na police bila makosa", meaning: "I was arrested by police without fault", intent: "needs legal assistance", urgency: 'high', category: 'legal' },
  { sheng: "nimekuwa mgonjwa wa akili", meaning: "I've become mentally ill", intent: "needs psychiatric care", urgency: 'high', category: 'mental_health' },
  { sheng: "sina protection dhidi ya violence", meaning: "I have no protection against violence", intent: "needs security assistance", urgency: 'high', category: 'legal' },
  { sheng: "nimeumia domestic violence", meaning: "I've suffered domestic violence", intent: "needs domestic violence support", urgency: 'high', category: 'legal' },
  { sheng: "nimekuwa victim wa sexual assault", meaning: "I've been a victim of sexual assault", intent: "needs trauma counseling and legal support", urgency: 'high', category: 'legal' },
  { sheng: "nimebanwa na cult", meaning: "I'm trapped in a cult", intent: "needs cult intervention services", urgency: 'high', category: 'emergency' },
  { sheng: "nimekuwa victim wa human trafficking", meaning: "I've been a victim of human trafficking", intent: "needs anti-trafficking support", urgency: 'high', category: 'legal' },

  // Medium priority
  { sheng: "nataka job", meaning: "I'm looking for a job", intent: "needs employment", urgency: 'medium', category: 'employment' },
  { sheng: "sina fare", meaning: "I don't have transport money", intent: "needs financial support", urgency: 'medium', category: 'financial' },
  { sheng: "niko down", meaning: "I'm feeling emotionally low", intent: "needs emotional support", urgency: 'medium', category: 'mental_health' },
  { sheng: "nimefinywa", meaning: "I'm being pressured / oppressed", intent: "needs advocacy or help", urgency: 'medium', category: 'support' },
  { sheng: "nataka kuomoka", meaning: "I want to succeed / escape hardship", intent: "career or financial help", urgency: 'medium', category: 'employment' },
  { sheng: "msee ameniharass", meaning: "Someone harassed me", intent: "needs legal or emotional support", urgency: 'medium', category: 'legal' },
  { sheng: "nimebeba ball", meaning: "I'm pregnant", intent: "needs medical or emotional support", urgency: 'medium', category: 'medical' },
  { sheng: "mtoi hana chakula", meaning: "My child has no food", intent: "needs food or child support", urgency: 'medium', category: 'support' },
  { sheng: "sina diapers", meaning: "I don't have diapers", intent: "needs baby supplies", urgency: 'medium', category: 'support' },
  { sheng: "nataka kutoka kwa base", meaning: "I want to leave my unsafe place", intent: "needs relocation/shelter", urgency: 'medium', category: 'shelter' },
  { sheng: "sina ID", meaning: "I don't have an ID", intent: "needs legal documentation support", urgency: 'medium', category: 'legal' },
  { sheng: "nataka kusomea kitu", meaning: "I want to study something", intent: "needs education or training", urgency: 'medium', category: 'education' },
  { sheng: "msee wangu ameniacha", meaning: "My partner left me", intent: "needs emotional or family support", urgency: 'medium', category: 'support' },
  { sheng: "niko na stress", meaning: "I'm stressed", intent: "needs mental health support", urgency: 'medium', category: 'mental_health' },
  { sheng: "sina doo", meaning: "I have no money", intent: "needs financial or welfare support", urgency: 'medium', category: 'financial' },
  { sheng: "nimevunjika moyo", meaning: "I'm heartbroken", intent: "needs emotional care", urgency: 'medium', category: 'mental_health' },
  { sheng: "nataka therapist", meaning: "I want a therapist", intent: "needs mental health support", urgency: 'medium', category: 'mental_health' },
  { sheng: "nataka lawyer", meaning: "I need a lawyer", intent: "needs legal aid", urgency: 'medium', category: 'legal' },
  { sheng: "naskia niko peke yangu", meaning: "I feel alone", intent: "needs emotional support", urgency: 'medium', category: 'mental_health' },
  { sheng: "sina mtu wa kunisaidia", meaning: "I have no one to help me", intent: "needs social support", urgency: 'medium', category: 'support' },
  { sheng: "nimekosana na msee", meaning: "I had a fight with someone", intent: "needs mediation or support", urgency: 'medium', category: 'support' },
  { sheng: "nimepoteza job", meaning: "I lost my job", intent: "needs employment support", urgency: 'medium', category: 'employment' },
  { sheng: "nataka mchongo ya kazi", meaning: "I want a job opportunity", intent: "needs job placement", urgency: 'medium', category: 'employment' },
  { sheng: "nimechanganyikiwa", meaning: "I'm confused", intent: "needs guidance or emotional support", urgency: 'medium', category: 'support' },
  { sheng: "nataka kazi ya haraka", meaning: "I need a job urgently", intent: "emergency job placement", urgency: 'medium', category: 'employment' },
  { sheng: "niko kwa mashida ya msee", meaning: "I'm in relationship-related trouble", intent: "needs relationship or safety help", urgency: 'medium', category: 'support' },
  { sheng: "sina mtu wa kunijali", meaning: "I feel neglected", intent: "needs social and emotional support", urgency: 'medium', category: 'support' },
  { sheng: "nimejam kwa deni", meaning: "I'm drowning in debt", intent: "needs financial counseling", urgency: 'medium', category: 'financial' },
  { sheng: "familia imeniacha", meaning: "My family has abandoned me", intent: "needs emotional support", urgency: 'medium', category: 'support' },
  { sheng: "siwezi afford chakula", meaning: "I can't afford food", intent: "needs food assistance", urgency: 'medium', category: 'support' },
  { sheng: "sina fare ya kurudi nyumbani", meaning: "I don't have transport money to go home", intent: "needs immediate assistance", urgency: 'medium', category: 'financial' },
  { sheng: "nimezeeka kwa mitaani", meaning: "I've been living on the streets for long", intent: "needs shelter and social services", urgency: 'medium', category: 'shelter' },
  { sheng: "nimekanyagwa na maboss", meaning: "I've been exploited by my bosses", intent: "needs labor rights support", urgency: 'medium', category: 'legal' },
  { sheng: "sina dough ya dawa", meaning: "I don't have money for medicine", intent: "needs medical financial assistance", urgency: 'medium', category: 'financial' },
  { sheng: "nimekataliwa na landlord", meaning: "I've been rejected by the landlord", intent: "needs housing assistance", urgency: 'medium', category: 'shelter' },
  { sheng: "nimeshikwa na machozi", meaning: "I'm overwhelmed with tears/sadness", intent: "needs emotional counseling", urgency: 'medium', category: 'mental_health' },
  { sheng: "nimeumia sana roho", meaning: "I'm deeply hurt emotionally", intent: "needs psychological support", urgency: 'medium', category: 'mental_health' },
  { sheng: "sina mtu wa kuniongelesha", meaning: "I have no one to talk to", intent: "needs counseling or friendship", urgency: 'medium', category: 'mental_health' },
  { sheng: "nimeangushwa shule", meaning: "I've been dropped from school", intent: "needs educational support", urgency: 'medium', category: 'education' },
  { sheng: "nimekuwa victim wa con", meaning: "I've been a victim of fraud", intent: "needs legal assistance", urgency: 'medium', category: 'legal' },
  { sheng: "siezi afford rent", meaning: "I can't afford rent", intent: "needs housing assistance", urgency: 'medium', category: 'shelter' },
  { sheng: "sina support ya family", meaning: "I don't have family support", intent: "needs social services", urgency: 'medium', category: 'support' },
  { sheng: "nimeumia kwa accident", meaning: "I was injured in an accident", intent: "needs medical attention", urgency: 'medium', category: 'medical' },
  { sheng: "nimekosa direction ya maisha", meaning: "I've lost direction in life", intent: "needs life coaching or counseling", urgency: 'medium', category: 'support' },
  { sheng: "siezi afford lawyer", meaning: "I can't afford a lawyer", intent: "needs legal aid", urgency: 'medium', category: 'legal' },
  { sheng: "nimekuwa addict", meaning: "I've become an addict", intent: "needs rehabilitation services", urgency: 'medium', category: 'medical' },
  { sheng: "sina documents za muhimu", meaning: "I don't have important documents", intent: "needs administrative assistance", urgency: 'medium', category: 'legal' },
  { sheng: "nimeachwa na mwenzi", meaning: "I've been left by my partner", intent: "needs emotional support", urgency: 'medium', category: 'support' },
  { sheng: "nimepatwa na pregnancy bila mpango", meaning: "I got pregnant without planning", intent: "needs reproductive health support", urgency: 'medium', category: 'medical' },
  { sheng: "nimekuwa homeless", meaning: "I've become homeless", intent: "needs shelter services", urgency: 'medium', category: 'shelter' },
  { sheng: "sina skills za kujitegemea", meaning: "I don't have skills to be self-reliant", intent: "needs skills training", urgency: 'medium', category: 'education' },
  { sheng: "nimebanwa na loan sharks", meaning: "I'm trapped by loan sharks", intent: "needs financial protection", urgency: 'medium', category: 'legal' },
  { sheng: "nimekuwa refugee", meaning: "I've become a refugee", intent: "needs refugee services", urgency: 'medium', category: 'support' },
  { sheng: "sina access ya basic needs", meaning: "I don't have access to basic needs", intent: "needs humanitarian assistance", urgency: 'medium', category: 'support' },
  { sheng: "sina maji safi", meaning: "I don't have clean water", intent: "needs water assistance", urgency: 'medium', category: 'support' },
  { sheng: "nimeachwa na watoto peke yangu", meaning: "I've been left alone with children", intent: "needs single parent support", urgency: 'medium', category: 'support' },
  { sheng: "sina pension ya kuzee", meaning: "I don't have pension for old age", intent: "needs elderly care planning", urgency: 'medium', category: 'support' },
  { sheng: "nimekuwa disabled bila support", meaning: "I've become disabled without support", intent: "needs disability services", urgency: 'medium', category: 'support' },
  { sheng: "sina insurance ya health", meaning: "I don't have health insurance", intent: "needs healthcare access assistance", urgency: 'medium', category: 'financial' },
  { sheng: "nimekuwa orphan", meaning: "I've become an orphan", intent: "needs orphan care services", urgency: 'medium', category: 'support' },
  { sheng: "sina transport ya hosi", meaning: "I don't have transport to the hospital", intent: "needs emergency transport", urgency: 'medium', category: 'financial' },
  { sheng: "nimepatwa na disaster", meaning: "I've been hit by disaster", intent: "needs disaster relief", urgency: 'medium', category: 'emergency' },
  { sheng: "sina education ya watoto", meaning: "I can't provide education for my children", intent: "needs educational assistance", urgency: 'medium', category: 'education' },
  { sheng: "nimebanwa na addiction ya gambling", meaning: "I'm trapped by gambling addiction", intent: "needs gambling addiction treatment", urgency: 'medium', category: 'medical' },
  { sheng: "nimekuwa victim wa cybercrime", meaning: "I've been a victim of cybercrime", intent: "needs cybercrime assistance", urgency: 'medium', category: 'legal' },

  // Low priority - general support
  { sheng: "nataka kusaidiwa", meaning: "I want help", intent: "general support request", urgency: 'low', category: 'support' },
  { sheng: "nataka kujifunza kitu", meaning: "I want to learn something", intent: "needs education or training", urgency: 'low', category: 'education' }
];

// Enhanced matching function with trauma-informed response
export const matchShengIntent = (message: string): {
  intent: ShengIntent | null;
  confidence: number;
  matches: string[];
} => {
  const lowerMessage = message.toLowerCase().trim();
  let bestMatch: ShengIntent | null = null;
  let bestScore = 0;
  const matches: string[] = [];

  console.log('Matching Sheng intent for:', lowerMessage);

  for (const shengIntent of shengIntents) {
    const shengPhrase = shengIntent.sheng.toLowerCase();
    let score = 0;

    // Direct phrase matching (highest priority)
    if (lowerMessage.includes(shengPhrase)) {
      score += 10;
      matches.push(shengPhrase);
      console.log(`Direct match found: "${shengPhrase}" (score: ${score})`);
    } else {
      // Word-level matching
      const messageWords = lowerMessage.split(/\s+/);
      const phraseWords = shengPhrase.split(/\s+/);
      
      let wordMatches = 0;
      for (const phraseWord of phraseWords) {
        if (messageWords.some(msgWord => 
          msgWord === phraseWord || 
          msgWord.includes(phraseWord) || 
          phraseWord.includes(msgWord)
        )) {
          wordMatches++;
        }
      }
      
      // Calculate word match score
      if (wordMatches > 0) {
        score += (wordMatches / phraseWords.length) * 7;
        if (score > 3) {
          matches.push(shengPhrase);
          console.log(`Word match found: "${shengPhrase}" (${wordMatches}/${phraseWords.length} words, score: ${score})`);
        }
      }
    }

    // Urgency boost for critical situations
    if (shengIntent.urgency === 'critical' && score > 0) {
      score += 3;
    } else if (shengIntent.urgency === 'high' && score > 0) {
      score += 2;
    }

    // Update best match
    if (score > bestScore && score > 2) {
      bestScore = score;
      bestMatch = shengIntent;
    }
  }

  const confidence = Math.min(bestScore / 10, 1.0);
  
  console.log('Best Sheng intent match:', {
    intent: bestMatch?.intent,
    sheng: bestMatch?.sheng,
    confidence,
    urgency: bestMatch?.urgency,
    category: bestMatch?.category
  });

  return {
    intent: bestMatch,
    confidence,
    matches
  };
};

// Generate trauma-informed response based on Sheng intent
export const generateShengResponse = (shengIntent: ShengIntent, language: string = 'sheng'): string => {
  const responses = {
    critical: {
      sheng: [
        "Pole sana mresh. Hii ni serious sana. Nitakusaidia haraka.",
        "Naona uko kwa shida kubwa. Tusiwaste time - nitakuconnect na msaada wa haraka.",
        "Mresh, nauona situation yako ni mbaya. Nitakusaidia sasa hivi."
      ],
      swahili: [
        "Pole sana rafiki. Hii ni dharura. Nitakusaidia haraka.",
        "Naona hali yako ni mbaya sana. Nitakupatia msaada wa haraka.",
        "Samahani kwa hali hii. Nitakusaidia bila kuchelewa."
      ],
      english: [
        "I'm so sorry you're going through this. This is urgent - let me help you right away.",
        "I can see you're in a serious situation. Let me connect you with immediate help.",
        "I understand this is critical. Let me get you emergency assistance now."
      ]
    },
    high: {
      sheng: [
        "Pole sana bro. Hii ni serious. Nitakusaidia na msaada wa haraka.",
        "Naona uko kwa situation mbaya. Nitakuhelp na priority.",
        "Mresh, hii haikuangi. Nitakusaidia kupata help ya haraka."
      ],
      swahili: [
        "Pole sana. Hii ni hali ya dharura. Nitakusaidia kupata msaada.",
        "Naona umehitaji msaada wa haraka. Nitakusaidia.",
        "Hii ni serious. Nitakupatia msaada wa haraka."
      ],
      english: [
        "I'm sorry this is happening to you. This is serious - let me help you quickly.",
        "I can see you need urgent help. Let me connect you with support.",
        "This is important. Let me get you the help you need right away."
      ]
    },
    medium: {
      sheng: [
        "Pole sana mresh. Nitakusaidia na hii issue.",
        "Naona unaweza msaada. Nitakuhelp na hii.",
        "Sawa bro, nitakusaidia na hii shida yako."
      ],
      swahili: [
        "Pole sana. Nitakusaidia na hii tatizo.",
        "Naona unahitaji msaada. Nitakusaidia.",
        "Sawa, nitakusaidia kupata msaada."
      ],
      english: [
        "I'm sorry you're dealing with this. Let me help you with this.",
        "I can see you need support. Let me help you.",
        "I understand. Let me help you with this situation."
      ]
    },
    low: {
      sheng: [
        "Sawa mresh, nitakusaidia na hii.",
        "Poa, nitakuhelp na unachohitaji.",
        "Sawa bro, nitakusaidia."
      ],
      swahili: [
        "Sawa, nitakusaidia na hii.",
        "Poa, nitakupatia msaada.",
        "Sawa, nitakusaidia."
      ],
      english: [
        "Okay, let me help you with this.",
        "Sure, I can help you with that.",
        "I'm here to help you."
      ]
    }
  };

  const urgencyResponses = responses[shengIntent.urgency];
  const langResponses = urgencyResponses[language as keyof typeof urgencyResponses] || urgencyResponses.sheng;
  const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)];
  
  return randomResponse;
};
