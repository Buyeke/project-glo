
// Sample intents for testing - these should be added to the database
export const sampleIntents = [
  {
    intent_key: 'shelter_request',
    category: 'housing',
    keywords: {
      english: ['shelter', 'house', 'housing', 'place to stay', 'homeless', 'accommodation', 'room'],
      swahili: ['makazi', 'nyumba', 'mahali pa kulala', 'shelter', 'kaa'],
      sheng: ['keja', 'mbanyo', 'place', 'crib'],
      arabic: ['مأوى', 'منزل', 'سكن', 'مكان للإقامة']
    },
    response_template: {
      english: 'I can help you find emergency shelter and safe housing. Our network includes 10+ verified shelters that provide immediate accommodation, meals, and safety for women and children. Would you like me to connect you with the nearest available shelter?',
      swahili: 'Naweza kukusaidia kupata makazi ya dharura na nyumba salama. Mtandao wetu una makazi 10+ yaliyothibitishwa yanayotoa malazi ya haraka, chakula, na usalama kwa wanawake na watoto. Je, ungependa nikusaidicie kuunganisha na makazi yaliyo karibu na yanapatikana?',
      sheng: 'Naeza kukusort na keja za emergency na safe places. Tuko na network ya shelters 10+ verified zenye accommodation ya haraka, food, na security kwa mama na watoi. Utaka ni-connect na shelter iliyo karibu?',
      arabic: 'يمكنني مساعدتك في العثور على مأوى طارئ وسكن آمن. شبكتنا تشمل أكثر من 10 ملاجئ موثقة توفر إقامة فورية ووجبات وأمان للنساء والأطفال. هل تود أن أربطك بأقرب ملجأ متاح؟'
    }
  },
  {
    intent_key: 'food_assistance',
    category: 'basic_needs',
    keywords: {
      english: ['food', 'hungry', 'eat', 'meal', 'nutrition', 'feeding', 'starving'],
      swahili: ['chakula', 'njaa', 'kula', 'mlo', 'lishe', 'kulisha'],
      sheng: ['food', 'dishi', 'kula', 'starve', 'njaa'],
      arabic: ['طعام', 'جوع', 'أكل', 'وجبة', 'تغذية']
    },
    response_template: {
      english: 'I understand you need food assistance. We can connect you with food banks, community kitchens, and nutrition programs in your area. Many provide immediate meals and food packages for families. Would you like information about food services near you?',
      swahili: 'Naelewa unahitaji msaada wa chakula. Tunaweza kukuunganisha na makabati ya chakula, majiko ya kijamii, na mipango ya lishe katika eneo lako. Wengi hutoa milo ya haraka na vifurushi vya chakula kwa familia. Je, ungependa taarifa kuhusu huduma za chakula karibu nawe?',
      sheng: 'Nasoma unahitaji food assistance. Tunaweza ku-connect na food banks, community kitchens, na nutrition programs za area yako. Wengi wanatoa dishi za haraka na food packages kwa familia. Utaka info ya food services za karibu?',
      arabic: 'أفهم أنك تحتاج للمساعدة الغذائية. يمكننا ربطك ببنوك الطعام والمطابخ المجتمعية وبرامج التغذية في منطقتك. الكثير منها يوفر وجبات فورية وحزم طعام للعائلات. هل تريد معلومات عن خدمات الطعام بالقرب منك؟'
    }
  },
  {
    intent_key: 'medical_help',
    category: 'healthcare',
    keywords: {
      english: ['doctor', 'medical', 'health', 'sick', 'hospital', 'medicine', 'treatment', 'clinic'],
      swahili: ['daktari', 'matibabu', 'afya', 'mgonjwa', 'hospitali', 'dawa', 'matibabu', 'kliniki'],
      sheng: ['daktari', 'docc', 'medical', 'sick', 'hospi', 'dawa'],
      arabic: ['طبيب', 'طبي', 'صحة', 'مريض', 'مستشفى', 'دواء', 'علاج', 'عيادة']
    },
    response_template: {
      english: 'I can help you access healthcare services. Our network includes clinics, hospitals, and mobile health units that provide medical care, prenatal services, and emergency treatment. Many offer free or low-cost care. Do you need immediate medical attention or regular healthcare services?',
      swahili: 'Naweza kukusaidia kupata huduma za afya. Mtandao wetu una kliniki, hospitali, na vitengo vya afya vya kuzunguka vinavyotoa huduma za matibabu, huduma za kabla ya kuzaa, na matibabu wa dharura. Wengi wanatoa huduma za bure au za bei nafuu. Je, unahitaji huduma za matibabu za haraka au huduma za kawaida za afya?',
      sheng: 'Naeza kukusaidia kupata healthcare services. Network yetu ina clinics, hospitals, na mobile health units zenye medical care, prenatal services, na emergency treatment. Wengi wanatoa free au low-cost care. Unahitaji immediate medical attention ama regular healthcare services?',
      arabic: 'يمكنني مساعدتك في الوصول لخدمات الرعاية الصحية. شبكتنا تشمل عيادات ومستشفيات ووحدات صحية متنقلة توفر الرعاية الطبية وخدمات ما قبل الولادة والعلاج الطارئ. الكثير منها يقدم رعاية مجانية أو منخفضة التكلفة. هل تحتاج عناية طبية فورية أم خدمات رعاية صحية منتظمة؟'
    }
  },
  {
    intent_key: 'emergency_help',
    category: 'emergency',
    keywords: {
      english: ['emergency', 'urgent', 'help', 'danger', 'crisis', 'abuse', 'violence', 'threat', 'immediate'],
      swahili: ['dharura', 'haraka', 'msaada', 'hatari', 'mkasa', 'unyanyasaji', 'unyanyapaa', 'tishio', 'mara moja'],
      sheng: ['emergency', 'urgent', 'msaada', 'danger', 'immediate', 'haraka sana'],
      arabic: ['طوارئ', 'عاجل', 'مساعدة', 'خطر', 'أزمة', 'إساءة', 'عنف', 'تهديد', 'فوري']
    },
    response_template: {
      english: '🚨 This sounds like an emergency situation. If you are in immediate danger, please call emergency services (999) or go to the nearest police station. For urgent support, I can connect you with our 24/7 crisis helpline and emergency shelter services. Are you safe right now?',
      swahili: '🚨 Hii inaonekana kama hali ya dharura. Ikiwa uko katika hatari ya haraka, tafadhali piga simu ya huduma za dharura (999) au uende kituo cha polisi cha karibu. Kwa msaada wa haraka, naweza kukuunganisha na msaada wetu wa simu wa saa 24/7 na huduma za makazi ya dharura. Je, uko salama sasa hivi?',
      sheng: '🚨 Hii inasound kama emergency situation. Kama uko kwa danger ya immediate, call emergency services (999) ama uende police station ya karibu. Kwa urgent support, naeza ku-connect na 24/7 crisis helpline yetu na emergency shelter services. Uko safe right now?',
      arabic: '🚨 يبدو هذا كموقف طارئ. إذا كنت في خطر فوري، يرجى الاتصال بخدمات الطوارئ (999) أو التوجه لأقرب مركز شرطة. للدعم العاجل، يمكنني ربطك بخط المساعدة للأزمات 24/7 وخدمات الملجأ الطارئ. هل أنت بأمان الآن؟'
    }
  }
];

// Function to seed the database with sample intents
export const seedIntents = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const { data, error } = await supabase
      .from('chatbot_intents')
      .upsert(sampleIntents.map(intent => ({
        ...intent,
        id: undefined // Let the database generate the ID
      })));
    
    if (error) throw error;
    console.log('Sample intents seeded successfully');
    return data;
  } catch (error) {
    console.error('Error seeding intents:', error);
    throw error;
  }
};
