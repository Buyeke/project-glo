// Emergency detection utilities

export interface EmergencyService {
  name: string;
  number: string;
  altNumber?: string;
  description: string;
}

export const EMERGENCY_KEYWORDS = [
  'emergency', 'help me', 'danger', 'hurt', 'abuse', 'violence',
  'msaada', 'hatari', 'kupigwa', 'dharura',
  'nimebanwa', 'kupigwa na msee', 'nimepotea', 'nimechoka na life',
  'nataka kujitoa', 'nimefukuzwa', 'nimepigwa vibaya',
  'nataka kuhepa', 'nimefungiwa', 'niko kwa lockdown',
  'nimebebwa kwa nguvu',
  'suicide', 'kill myself', 'end my life', 'die',
];

export const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'die', 'want to die',
  'nataka kujitoa', 'nimechoka na life', 'kujiua',
];

export const detectEmergency = (input: string | Record<string, any>): boolean => {
  // Convert input to searchable string
  const text = typeof input === 'string' 
    ? input.toLowerCase() 
    : Object.values(input).map(v => String(v)).join(' ').toLowerCase();
  
  return EMERGENCY_KEYWORDS.some(keyword => text.includes(keyword));
};

export const detectEmergencyDetailed = (message: string): { isEmergency: boolean; isCrisis: boolean; urgencyLevel: string } => {
  const lowerMessage = message.toLowerCase();
  
  const isCrisis = CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  const isEmergency = isCrisis || EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  
  let urgencyLevel = 'low';
  if (isCrisis) urgencyLevel = 'critical';
  else if (isEmergency) urgencyLevel = 'high';
  
  return { isEmergency, isCrisis, urgencyLevel };
};

export const getEmergencyServices = (): EmergencyService[] => [
  {
    name: "Kenya Police",
    number: "999",
    altNumber: "112",
    description: "Emergency police response (Nationwide)"
  },
  {
    name: "Childline Kenya",
    number: "116",
    description: "Child protection helpline (Nationwide)"
  },
  {
    name: "GBV Hotline",
    number: "1195",
    description: "Gender-Based Violence helpline (Healthcare Assistance Kenya)"
  },
  {
    name: "Gender Violence Recovery Centre (GVRC)",
    number: "0709 319 000",
    description: "Comprehensive GBV support (Nairobi)"
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
    return `${c.name}: ${numbers}`;
  });
  return `\n\nEmergency contacts:\n${lines.join('\n')}`;
};
