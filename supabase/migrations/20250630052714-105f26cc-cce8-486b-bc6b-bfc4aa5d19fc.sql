
-- Create chat_interactions table for logging chatbot conversations
CREATE TABLE public.chat_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  detected_language TEXT,
  original_message TEXT NOT NULL,
  translated_message TEXT,
  matched_intent TEXT,
  response TEXT NOT NULL,
  translated_response TEXT,
  confidence_score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on chat_interactions
ALTER TABLE public.chat_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_interactions
CREATE POLICY "Users can view their own chat interactions" ON public.chat_interactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat interactions" ON public.chat_interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin policy for reviewing chat interactions
CREATE POLICY "Admins can view all chat interactions" ON public.chat_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create intents lookup table for better management
CREATE TABLE public.chatbot_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  intent_key TEXT UNIQUE NOT NULL,
  keywords JSONB NOT NULL,
  response_template JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on chatbot_intents
ALTER TABLE public.chatbot_intents ENABLE ROW LEVEL SECURITY;

-- Public read access for intents (needed for chatbot functionality)
CREATE POLICY "Anyone can view chatbot intents" ON public.chatbot_intents
  FOR SELECT TO authenticated, anon
  USING (true);

-- Admin policy for managing intents
CREATE POLICY "Admins can manage chatbot intents" ON public.chatbot_intents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Insert predefined intents data (fixed JSON escaping)
INSERT INTO public.chatbot_intents (category, intent_key, keywords, response_template) VALUES
-- Basic Service Access
('basic_service', 'find_shelter', 
 '{"english": ["shelter", "sleep", "place to stay", "housing", "accommodation"], "swahili": ["mahali pa kulala", "makazi", "shelter", "kulala"], "arabic": ["مأوى", "مكان للنوم", "سكن"], "sheng": ["base", "place ya kulala"]}',
 '{"english": "I can help you find emergency shelter! Our network has 10+ partner facilities providing safe housing. Would you like me to find available shelters in your area? You can also call our emergency hotline at 0800-SHELTER.", "swahili": "Naweza kukusaidia kupata makazi ya dharura! Mtandao wetu una mazingira 10+ ya usalama. Je, ungependa nikutafutie makazi yaliyopo katika eneo lako?", "arabic": "يمكنني مساعدتك في العثور على مأوى طارئ! شبكتنا لديها أكثر من 10 مرافق شريكة توفر سكن آمن. هل تريد مني العثور على ملاجئ متاحة في منطقتك؟", "sheng": "Naeza kukusort na place ya emergency! Tuko na network ya bases 10+ zenye safety. Ungependa nikutafutie place karibu nawe?"}'),

('basic_service', 'get_food', 
 '{"english": ["food", "hungry", "eat", "meal", "nutrition"], "swahili": ["chakula", "njaa", "kula", "mlo"], "arabic": ["طعام", "جوعان", "وجبة"], "sheng": ["food", "njaa", "dishi"]}',
 '{"english": "I can help you locate food distribution centers and meal programs. We work with community partners to provide nutritious meals. Would you like me to find food assistance near you?", "swahili": "Naweza kukusaidia kupata vituo vya ugavi wa chakula na mipango ya milo. Tunafanya kazi na washirika wa jamii kutoa milo yenye lishe. Je, ungependa nipate msaada wa chakula karibu nawe?", "arabic": "يمكنني مساعدتك في العثور على مراكز توزيع الطعام وبرامج الوجبات. نعمل مع شركاء المجتمع لتوفير وجبات مغذية. هل تريد مني العثور على مساعدة غذائية بالقرب منك؟", "sheng": "Naeza kukusaidia kupata place za food distribution na meal programs. Tunashirikiana na community kusort na dishi za nutrition. Ungependa nipate food assistance karibu?"}'),

('basic_service', 'get_healthcare', 
 '{"english": ["healthcare", "doctor", "medical", "sick", "clinic"], "swahili": ["daktari", "mgonjwa", "kliniki", "afya"], "arabic": ["طبيب", "مريض", "عيادة"], "sheng": ["doki", "sick", "clinic"]}',
 '{"english": "I can connect you with healthcare services including primary care, maternal health, and wellness programs. Would you like me to find medical assistance near you?", "swahili": "Naweza kukuunganisha na huduma za afya ikiwa ni pamoja na huduma za msingi, afya ya mama, na mipango ya ustawi. Je, ungependa nipate msaada wa kimatibabu karibu nawe?", "arabic": "يمكنني ربطك بخدمات الرعاية الصحية بما في ذلك الرعاية الأولية وصحة الأمهات وبرامج العافية. هل تريد مني العثور على مساعدة طبية بالقرب منك؟", "sheng": "Naeza kukuconnect na healthcare services including primary care, maternal health, na wellness programs. Ungependa nipate medical assistance karibu?"}'),

-- Emergency Support
('emergency', 'report_abuse', 
 '{"english": ["abuse", "violence", "hurt", "beaten", "assault"], "swahili": ["unyanyasaji", "jeruhi", "kupigwa", "udhalimu"], "arabic": ["إساءة", "عنف", "اعتداء"], "sheng": ["kudhulumiwa", "kupigwa", "violence"]}',
 '{"english": "I am sorry you are experiencing this. Your safety is our priority. Please call 911 immediately if you are in danger. For confidential support, contact our crisis line at 0800-CRISIS or reach out to local authorities. You are not alone.", "swahili": "Pole kwa hali hii. Usalama wako ni kipaumbele chetu. Tafadhali piga 911 mara moja ikiwa uko hatarini. Kwa msaada wa siri, wasiliana na mstari wetu wa msaada 0800-CRISIS.", "arabic": "أنا آسف لما تمرين به. سلامتك هي أولويتنا. يرجى الاتصال بالرقم 911 فوراً إذا كنت في خطر. للحصول على دعم سري، اتصلي بخط الأزمات 0800-CRISIS.", "sheng": "Pole sana kwa hiyo. Safety yako ni priority. Piga 911 haraka ukiwa na danger. Kwa msaada wa confidential, piga 0800-CRISIS."}'),

('emergency', 'emergency_contact', 
 '{"english": ["emergency", "urgent", "help now", "crisis"], "swahili": ["dharura", "haraka", "msaada sasa"], "arabic": ["طوارئ", "عاجل", "مساعدة الآن"], "sheng": ["emergency", "haraka", "help sasa"]}',
 '{"english": "This is an emergency situation. Please call 911 immediately for urgent help. Our crisis hotline is also available 24/7 at 0800-CRISIS. Stay safe and reach out to local emergency services.", "swahili": "Hii ni hali ya dharura. Tafadhali piga 911 mara moja kwa msaada wa haraka. Mstari wetu wa msaada pia unapatikana masaa 24/7 kwa 0800-CRISIS.", "arabic": "هذه حالة طوارئ. يرجى الاتصال بالرقم 911 فوراً للمساعدة العاجلة. خط الأزمات الخاص بنا متاح أيضاً على مدار الساعة طوال أيام الأسبوع على 0800-CRISIS.", "sheng": "Hii ni emergency situation. Piga 911 haraka for urgent help. Crisis hotline yetu iko available 24/7 kwa 0800-CRISIS."}'),

-- Platform Guidance
('platform', 'how_glo_works', 
 '{"english": ["how does glo work", "what is glo", "explain glo", "glo service"], "swahili": ["glo inafanyaje kazi", "glo ni nini", "huduma ya glo"], "arabic": ["كيف يعمل جلو", "ما هو جلو"], "sheng": ["glo inafanya aje", "glo ni nini"]}',
 '{"english": "Glo is an AI-powered platform supporting homeless women and children. We provide shelter access, job placement, mental health support, legal aid, and community integration through our network of 10+ partners. We have helped 50+ women and 100+ children. How can I assist you today?", "swahili": "Glo ni jukwaa lenye nguvu za AI linalosaidia wanawake na watoto wasio na makazi. Tunatoa upatikanaji wa makazi, ajira, msaada wa afya ya akili, msaada wa kisheria, na ujumuishaji wa jamii kupitia mtandao wetu wa washirika 10+.", "arabic": "جلو هو منصة مدعومة بالذكاء الاصطناعي تدعم النساء والأطفال المشردين. نوفر الوصول للمأوى، التوظيف، الدعم النفسي، المساعدة القانونية، والاندماج المجتمعي من خلال شبكة من أكثر من 10 شركاء.", "sheng": "Glo ni platform ya AI inasaidia wamama na watoto hawana nyumba. Tunapea shelter access, job placement, mental health support, legal aid, na community integration kupitia network ya partners 10+."}'),

('platform', 'language_support', 
 '{"english": ["language", "languages supported", "what languages"], "swahili": ["lugha", "lugha zinazoungwa", "lugha gani"], "arabic": ["لغة", "اللغات المدعومة"], "sheng": ["language", "lugha gani"]}',
 '{"english": "Glo supports English, Swahili, Arabic, and Sheng. You can communicate with me in any of these languages and I will respond accordingly. Would you like to switch to a different language?", "swahili": "Glo inasaidia Kiingereza, Kiswahili, Kiarabu, na Sheng. Unaweza kuongea nami kwa lugha yoyote kati ya hizi na nitajibu ipasavyo. Je, ungependa kubadilisha lugha?", "arabic": "يدعم جلو الإنجليزية والسواحيلية والعربية والشينج. يمكنك التواصل معي بأي من هذه اللغات وسأرد وفقاً لذلك. هل تريد التبديل إلى لغة مختلفة؟", "sheng": "Glo inasupport English, Kiswahili, Arabic, na Sheng. Unaweza kuongea nami kwa language yoyote kati ya hizi na nitarespond accordingly. Ungependa kubadilisha language?"}');
