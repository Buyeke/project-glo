
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
    name: "Kenya Police",
    number: "999",
    altNumber: "112",
    description: "Immediate emergency response (Nationwide)"
  },
  {
    name: "Childline Kenya",
    number: "116",
    description: "Child protection and support (Nationwide)"
  },
  {
    name: "GBV Hotline (Healthcare Assistance Kenya)",
    number: "1195",
    description: "Gender-based violence support (Nationwide)"
  },
  {
    name: "Gender Violence Recovery Centre (GVRC)",
    number: "0709 319 000",
    description: "GBV recovery services (Nairobi)"
  },
  {
    name: "FIDA Kenya (Legal Aid)",
    number: "0722 509 760",
    description: "Free legal aid for women (Nationwide)"
  }
];

export const formatEmergencyContactsForChat = (): string => {
  const contacts = getEmergencyServices();
  const lines = contacts.map(c => {
    const numbers = c.altNumber ? `${c.number} / ${c.altNumber}` : c.number;
    return `- ${c.name}: ${numbers}`;
  });
  return `\n\nIMPORTANT EMERGENCY CONTACTS:\n${lines.join('\n')}\n\nCall any of these numbers if you need immediate help.`;
};
