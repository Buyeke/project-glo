
-- Add new Sheng language intents and keywords
INSERT INTO chatbot_intents (intent_key, category, keywords, response_template) VALUES
('sheng_police_issue', 'emergency', 
 '{"english": ["police", "cop", "officer", "arrest", "harassment"], "swahili": ["polisi", "askari", "kamanda"], "sheng": ["karao", "mse", "sonko", "kanjo"]}',
 '{"english": "I understand you need help with a police-related issue. This is serious and we want to help you. You can report police misconduct or harassment through our legal aid partners. Would you like me to connect you with legal support?", "swahili": "Naelewa unahitaji msaada wa jambo la polisi. Hii ni kitu muhimu na tunataka kukusaidia. Unaweza kuripoti mwenendo mbaya wa polisi kupitia washirika wetu wa msaada wa kisheria.", "sheng": "Najua unahitaji help na issue ya karao. Hii ni serious na tunataka kukusaidia. Unaweza report mwenendo mbaya wa karao kupitia legal aid partners zetu."}'),

('sheng_money_help', 'financial_support', 
 '{"english": ["money", "cash", "financial", "broke", "poor"], "swahili": ["pesa", "fedha", "ukosefu"], "sheng": ["dough", "munde", "ganji", "bread", "coins"]}',
 '{"english": "I understand you need financial support. We can help connect you with emergency financial assistance, food aid, and job opportunities. What specific type of financial help do you need right now?", "swahili": "Naelewa unahitaji msaada wa kifedha. Tunaweza kukusaidia kupata msaada wa dharura wa kifedha, msaada wa chakula, na fursa za kazi.", "sheng": "Najua unahitaji msaada wa munde. Tunaweza kukuconnect na emergency financial assistance, food aid, na job opportunities."}'),

('sheng_food_hunger', 'basic_needs', 
 '{"english": ["hungry", "food", "eat", "meal", "starving"], "swahili": ["njaa", "chakula", "kula", "chakula"], "sheng": ["njaa", "dishi", "kula", "mlo"]}',
 '{"english": "I hear that you are hungry and need food. This is urgent and we want to help immediately. We can connect you with food banks, soup kitchens, and emergency food assistance in your area.", "swahili": "Nasikia una njaa na unahitaji chakula. Hii ni ya haraka na tunataka kukusaidia mara moja. Tunaweza kukuunganisha na mahali pa kupata chakula bure.", "sheng": "Nasikia una njaa na unahitaji dishi. Hii ni urgent na tunataka kukusaidia immediately. Tunaweza kukuconnect na food banks na emergency food assistance."}'),

('sheng_housing_shelter', 'shelter', 
 '{"english": ["homeless", "shelter", "sleep", "roof", "house"], "swahili": ["nyumba", "makazi", "kulala", "paa"], "sheng": ["kejani", "base", "place", "crib"]}',
 '{"english": "I understand you need a safe place to stay. Housing is a basic need and we have shelter partners who can help. Can you tell me your location so I can find the nearest safe shelter?", "swahili": "Naelewa unahitaji mahali salama pa kukaa. Makazi ni hitaji la msingi na tuna washirika wa makazi ambao wanaweza kusaidia.", "sheng": "Najua unahitaji safe place ya kukaa. Housing ni basic need na tuna shelter partners ambao wanaweza help. Unaweza niambie location yako nipate nearest safe kejani?"}'),

('sheng_health_medical', 'health', 
 '{"english": ["sick", "pain", "doctor", "hospital", "medicine"], "swahili": ["mgonjwa", "maumivu", "daktari", "hospitali", "dawa"], "sheng": ["sick", "pain", "dokta", "hosp"]}',
 '{"english": "I am concerned about your health issue. Medical care is important and you deserve treatment. We can help you find free or low-cost medical services, clinics, and health centers in your area.", "swahili": "Nina wasiwasi kuhusu tatizo lako la kiafya. Huduma za kimatibabu ni muhimu na unastahili matibabu. Tunaweza kukusaidia kupata huduma za bure za kimatibabu.", "sheng": "Nina concern kuhusu health issue yako. Medical care ni important na unadeserve treatment. Tunaweza kukusaidia find free ama low-cost medical services."}'),

('sheng_work_job', 'employment', 
 '{"english": ["job", "work", "employment", "income", "salary"], "swahili": ["kazi", "ajira", "kipato", "mshahara"], "sheng": ["job", "hustle", "work", "kazi"]}',
 '{"english": "I understand you are looking for work opportunities. Employment is important for stability and independence. We can help you find job training programs, employment services, and work opportunities.", "swahili": "Naelewa unatafuta fursa za kazi. Ajira ni muhimu kwa utulivu na kujitegemea. Tunaweza kukusaidia kupata mafunzo ya kazi na huduma za ajira.", "sheng": "Najua unatafuta job opportunities. Employment ni important kwa stability na independence. Tunaweza kukusaidia find job training programs na work opportunities."}'),

('sheng_school_education', 'education', 
 '{"english": ["school", "education", "learn", "study", "class"], "swahili": ["shule", "elimu", "kujifunza", "kusoma", "darasa"], "sheng": ["shule", "education", "learn", "study"]}',
 '{"english": "Education is very important and everyone deserves the chance to learn. We can help you find educational programs, scholarships, adult education classes, and skill training opportunities.", "swahili": "Elimu ni muhimu sana na kila mtu anastahili nafasi ya kujifunza. Tunaweza kukusaidia kupata mipango ya kielimu, ufadhili, na madarasa ya watu wazima.", "sheng": "Education ni very important na kila mtu anadeserve chance ya kulearn. Tunaweza kukusaidia find educational programs, scholarships, na skill training opportunities."}'),

('sheng_transport_travel', 'transportation', 
 '{"english": ["transport", "travel", "bus", "fare", "move"], "swahili": ["usafiri", "safari", "basi", "nauli", "kusonga"], "sheng": ["mat", "basi", "fare", "move"]}',
 '{"english": "I understand you need help with transportation. Getting around safely is important. We can help you find transportation assistance, bus passes, or emergency travel funds.", "swahili": "Naelewa unahitaji msaada wa usafiri. Kusafiri kwa usalama ni muhimu. Tunaweza kukusaidia kupata msaada wa usafiri ama pesa za dharura za safari.", "sheng": "Najua unahitaji help na transport. Getting around safely ni important. Tunaweza kukusaidia find transportation assistance ama emergency travel funds."}');

-- Update existing quick actions to include more Sheng terms
UPDATE chatbot_intents 
SET keywords = jsonb_set(keywords, '{sheng}', '["emergency", "dharura", "help", "msaada", "haraka"]')
WHERE intent_key = 'emergency_help';

UPDATE chatbot_intents 
SET keywords = jsonb_set(keywords, '{sheng}', '["talk", "ongea", "support", "msaada", "listen"]')
WHERE intent_key = 'emotional_support';
