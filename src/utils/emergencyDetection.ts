
// Emergency detection utility
export const detectEmergency = (responses: Record<string, any>, messageText?: string): boolean => {
  const emergencyKeywords = [
    // English
    'emergency', 'urgent', 'help now', 'crisis', 'danger', 'abuse', 'violence', 
    'hurt', 'beaten', 'assault', 'rape', 'attack', 'threat', 'bleeding', 
    'unconscious', 'overdose', 'suicide', 'missing child', 'kidnapped',
    
    // Swahili
    'dharura', 'haraka', 'msaada sasa', 'hatari', 'unyanyasaji', 'jeruhi',
    'kupigwa', 'udhalimu', 'msaada wa haraka',
    
    // Arabic
    'طوارئ', 'عاجل', 'مساعدة الآن', 'خطر', 'إساءة', 'عنف', 'اعتداء',
    
    // Sheng
    'emergency', 'haraka', 'help sasa', 'danger', 'kudhulumiwa', 'kupigwa'
  ];

  // Check message text for emergency keywords
  if (messageText) {
    const lowerText = messageText.toLowerCase();
    const hasEmergencyKeyword = emergencyKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    if (hasEmergencyKeyword) return true;
  }

  // Check assessment responses for emergency indicators
  const emergencyResponses = [
    'immediate_danger',
    'physical_abuse',
    'sexual_assault',
    'medical_emergency',
    'missing_child',
    'suicidal_thoughts',
    'overdose',
    'domestic_violence',
    'human_trafficking'
  ];

  for (const [key, value] of Object.entries(responses)) {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (emergencyResponses.some(emergency => lowerValue.includes(emergency))) {
        return true;
      }
      if (emergencyKeywords.some(keyword => lowerValue.includes(keyword.toLowerCase()))) {
        return true;
      }
    }
    
    // Check for high urgency indicators
    if (key.includes('urgency') && (value === 'immediate' || value === 'critical')) {
      return true;
    }
    
    // Check for safety-related boolean responses
    if (key.includes('safe') && value === false) {
      return true;
    }
  }

  return false;
};

export const getEmergencyServices = () => [
  {
    name: "Emergency Hotline",
    number: "911",
    description: "Immediate emergency response"
  },
  {
    name: "Crisis Support Line",
    number: "0800-CRISIS",
    description: "24/7 crisis counseling and support"
  },
  {
    name: "GBV Helpline",
    number: "0800-GBV-HELP",
    description: "Gender-based violence support"
  }
];
