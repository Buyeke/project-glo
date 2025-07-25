
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
  { sheng: "maliza story", meaning: "to end it all (suicide)", intent: "suicide crisis", urgency: 'critical', category: 'mental_health' },
  { sheng: "kudedi", meaning: "to die (slang)", intent: "suicide crisis or urgent danger", urgency: 'critical', category: 'mental_health' },
  { sheng: "kujitoa", meaning: "to end one's life", intent: "mental health crisis", urgency: 'critical', category: 'mental_health' },
  { sheng: "reskiu", meaning: "rescue", intent: "needs extraction from unsafe place", urgency: 'critical', category: 'emergency' },
  { sheng: "katikia", meaning: "to faint or black out", intent: "medical emergency", urgency: 'critical', category: 'medical' },
  { sheng: "chafua", meaning: "to violate or defile", intent: "sexual abuse or assault", urgency: 'critical', category: 'legal' },
  { sheng: "ameamua", meaning: "someone has made big decision (often suicidal)", intent: "crisis intervention needed", urgency: 'critical', category: 'mental_health' },
  { sheng: "emergency", meaning: "urgent situation", intent: "crisis requiring immediate attention", urgency: 'critical', category: 'emergency' },
  { sheng: "hatari", meaning: "danger", intent: "dangerous situations", urgency: 'critical', category: 'emergency' },
  { sheng: "mauaji", meaning: "killing/murder", intent: "life-threatening situations", urgency: 'critical', category: 'emergency' },
  { sheng: "kifo", meaning: "death", intent: "death-related crisis", urgency: 'critical', category: 'emergency' },

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
  { sheng: "deadstock", meaning: "someone who has lost hope", intent: "emotional or psychosocial support", urgency: 'high', category: 'mental_health' },
  { sheng: "kuchoma", meaning: "to burn out or break down", intent: "emotional or physical exhaustion", urgency: 'high', category: 'mental_health' },
  { sheng: "mambo tight", meaning: "things are very tough", intent: "needs urgent help or encouragement", urgency: 'high', category: 'support' },
  { sheng: "masponsor", meaning: "predatory older partners", intent: "needs safety, legal, or emotional aid", urgency: 'high', category: 'legal' },
  { sheng: "mathaa", meaning: "problems/troubles", intent: "having serious problems", urgency: 'high', category: 'support' },
  { sheng: "umeffi", meaning: "you're in trouble/messed up", intent: "serious problems or crisis", urgency: 'high', category: 'support' },
  { sheng: "usalama", meaning: "safety/security", intent: "security concerns", urgency: 'high', category: 'legal' },
  { sheng: "majeraha", meaning: "injuries", intent: "injury situations", urgency: 'high', category: 'medical' },
  { sheng: "damu", meaning: "blood", intent: "medical emergencies", urgency: 'high', category: 'medical' },

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

  // Additional comprehensive Sheng vocabulary
  { sheng: "ball", meaning: "pregnancy", intent: "needs maternal support or medical help", urgency: 'medium', category: 'medical' },
  { sheng: "base", meaning: "home or shelter", intent: "needs shelter or safe place", urgency: 'medium', category: 'shelter' },
  { sheng: "msee", meaning: "person (usually man)", intent: "referring to someone causing problems", urgency: 'medium', category: 'support' },
  { sheng: "kufinywa", meaning: "being mistreated or pressured", intent: "needs advocacy, safety, or emotional support", urgency: 'medium', category: 'support' },
  { sheng: "kuhepa", meaning: "to run away or escape", intent: "needs relocation, shelter, or rescue", urgency: 'medium', category: 'shelter' },
  { sheng: "kuchoka", meaning: "feeling tired or emotionally exhausted", intent: "mental health crisis", urgency: 'medium', category: 'mental_health' },
  { sheng: "kuomoka", meaning: "to succeed or escape hardship", intent: "needs economic empowerment", urgency: 'medium', category: 'employment' },
  { sheng: "doo", meaning: "money", intent: "needs financial or welfare support", urgency: 'medium', category: 'financial' },
  { sheng: "lockdown", meaning: "being controlled by someone", intent: "needs safety or legal aid", urgency: 'high', category: 'legal' },
  { sheng: "chapa job", meaning: "to work", intent: "needs employment or job placement", urgency: 'medium', category: 'employment' },
  { sheng: "ball ya force", meaning: "forced pregnancy", intent: "needs trauma support, legal and medical help", urgency: 'high', category: 'medical' },
  { sheng: "machungu", meaning: "deep emotional pain", intent: "needs emotional or mental support", urgency: 'medium', category: 'mental_health' },
  { sheng: "kunisaidia", meaning: "help me", intent: "general request for assistance", urgency: 'medium', category: 'support' },
  { sheng: "stress", meaning: "mental or emotional distress", intent: "needs counseling or support", urgency: 'medium', category: 'mental_health' },
  { sheng: "mtoi", meaning: "child", intent: "needs childcare, health, or food support", urgency: 'medium', category: 'support' },
  { sheng: "nimefungiwa", meaning: "I've been locked in", intent: "needs rescue or protection", urgency: 'critical', category: 'emergency' },
  { sheng: "kosa", meaning: "to lack or be without something", intent: "needs provision (money, ID, food, etc.)", urgency: 'medium', category: 'support' },
  { sheng: "nduthi", meaning: "motorcycle (boda)", intent: "transport or safety issues", urgency: 'medium', category: 'financial' },
  { sheng: "chuo", meaning: "school", intent: "needs education or training", urgency: 'medium', category: 'education' },
  { sheng: "ndai", meaning: "matatu (public transport)", intent: "needs transport access or fare", urgency: 'medium', category: 'financial' },
  { sheng: "potea", meaning: "to be lost", intent: "needs shelter or help navigating", urgency: 'medium', category: 'shelter' },
  { sheng: "vunjika moyo", meaning: "heartbroken", intent: "needs emotional care", urgency: 'medium', category: 'mental_health' },
  { sheng: "mjengo", meaning: "construction job", intent: "employment support, manual labor", urgency: 'medium', category: 'employment' },
  { sheng: "mtu wangu", meaning: "my partner", intent: "relationship contexts, possible abuse", urgency: 'medium', category: 'support' },
  { sheng: "kupiga simu", meaning: "to call", intent: "communication or reaching out for help", urgency: 'low', category: 'support' },
  { sheng: "futa machozi", meaning: "to comfort someone", intent: "emotional support", urgency: 'medium', category: 'mental_health' },
  { sheng: "area", meaning: "neighborhood or location", intent: "needed for local resource referrals", urgency: 'low', category: 'support' },
  { sheng: "msoto", meaning: "broke or without money", intent: "financial support needed", urgency: 'medium', category: 'financial' },
  { sheng: "mathe", meaning: "mother", intent: "family or caregiver situations", urgency: 'medium', category: 'support' },
  { sheng: "brokko", meaning: "totally broke", intent: "needs emergency financial help", urgency: 'medium', category: 'financial' },
  { sheng: "gava", meaning: "government or police", intent: "legal or state-related help", urgency: 'medium', category: 'legal' },
  { sheng: "ka-job", meaning: "small job or hustle", intent: "looking for work", urgency: 'medium', category: 'employment' },
  { sheng: "slum", meaning: "informal settlements", intent: "poverty-related shelter or safety", urgency: 'medium', category: 'shelter' },
  { sheng: "mandizi", meaning: "sanitary pads", intent: "hygiene support for girls or women", urgency: 'medium', category: 'support' },
  { sheng: "storo", meaning: "issue or situation", intent: "general request for help", urgency: 'medium', category: 'support' },
  { sheng: "madharau", meaning: "disrespect or being looked down on", intent: "needs emotional or social support", urgency: 'medium', category: 'mental_health' },
  { sheng: "hustle", meaning: "work or side jobs", intent: "income-generation or employment help", urgency: 'medium', category: 'employment' },
  { sheng: "kujikaza", meaning: "to keep going under pressure", intent: "encouragement or resilience support", urgency: 'medium', category: 'mental_health' },

  // Additional comprehensive vocabulary
  { sheng: "chapaa", meaning: "money", intent: "financial discussions, money problems", urgency: 'medium', category: 'financial' },
  { sheng: "doh", meaning: "money (from dough)", intent: "financial troubles, lack of funds", urgency: 'medium', category: 'financial' },
  { sheng: "ganji", meaning: "money", intent: "financial needs, money issues", urgency: 'medium', category: 'financial' },
  { sheng: "mkwanja", meaning: "money", intent: "financial problems, monetary concerns", urgency: 'medium', category: 'financial' },
  { sheng: "mapeni", meaning: "money", intent: "financial assistance needed", urgency: 'medium', category: 'financial' },
  { sheng: "mbecha", meaning: "money", intent: "financial crisis situations", urgency: 'medium', category: 'financial' },
  { sheng: "baroda", meaning: "money", intent: "financial help required", urgency: 'medium', category: 'financial' },
  { sheng: "kichele", meaning: "money", intent: "money-related problems", urgency: 'medium', category: 'financial' },
  { sheng: "maziwa", meaning: "money", intent: "financial needs", urgency: 'medium', category: 'financial' },
  { sheng: "cheddah", meaning: "money", intent: "financial troubles", urgency: 'medium', category: 'financial' },
  { sheng: "poa", meaning: "cool/fine/okay", intent: "checking if someone is okay", urgency: 'low', category: 'support' },
  { sheng: "jam", meaning: "stuck/trapped", intent: "being in trouble or difficult situation", urgency: 'medium', category: 'support' },
  { sheng: "banwa", meaning: "caught/trapped/in trouble", intent: "being in crisis or difficult situation", urgency: 'high', category: 'emergency' },
  { sheng: "shangaa", meaning: "be surprised/shocked", intent: "expressing distress or disbelief", urgency: 'medium', category: 'mental_health' },
  { sheng: "kushinda", meaning: "to defeat/overcome", intent: "being overwhelmed by problems", urgency: 'medium', category: 'support' },
  { sheng: "kuchizi", meaning: "to be crazy/mad", intent: "mental health concerns", urgency: 'medium', category: 'mental_health' },
  { sheng: "kujam", meaning: "to get stuck", intent: "being trapped in problems", urgency: 'medium', category: 'support' },
  { sheng: "kupiga", meaning: "to hit/beat", intent: "violence or abuse situations", urgency: 'high', category: 'legal' },
  { sheng: "kuroga", meaning: "to bewitch/to be sick", intent: "illness or health problems", urgency: 'medium', category: 'medical' },
  { sheng: "kuskuma", meaning: "to struggle/push hard", intent: "struggling with life difficulties", urgency: 'medium', category: 'support' },
  { sheng: "mambo", meaning: "things/issues", intent: "problems or situations", urgency: 'medium', category: 'support' },
  { sheng: "hali", meaning: "situation/condition", intent: "current problematic state", urgency: 'medium', category: 'support' },
  { sheng: "mazee", meaning: "old man/elder", intent: "referring to authority figure", urgency: 'low', category: 'support' },
  { sheng: "demu", meaning: "girl/woman", intent: "gender-specific crisis contexts", urgency: 'medium', category: 'support' },
  { sheng: "buda", meaning: "brother/friend", intent: "seeking help from friends", urgency: 'low', category: 'support' },
  { sheng: "matha", meaning: "mother", intent: "family-related problems", urgency: 'medium', category: 'support' },
  { sheng: "mboch", meaning: "housemaid", intent: "employment or domestic issues", urgency: 'medium', category: 'employment' },
  { sheng: "jobless", meaning: "unemployed", intent: "unemployment crisis", urgency: 'medium', category: 'employment' },
  { sheng: "broke", meaning: "having no money", intent: "financial emergency", urgency: 'medium', category: 'financial' },
  { sheng: "tension", meaning: "stress/pressure", intent: "emotional distress", urgency: 'medium', category: 'mental_health' },
  { sheng: "ground", meaning: "home area/base", intent: "location-based problems", urgency: 'medium', category: 'shelter' },
  { sheng: "mtaa", meaning: "neighborhood/street", intent: "local area problems", urgency: 'medium', category: 'support' },
  { sheng: "keja", meaning: "house/room", intent: "housing problems", urgency: 'medium', category: 'shelter' },
  { sheng: "bedsitter", meaning: "one-room apartment", intent: "housing difficulties", urgency: 'medium', category: 'shelter' },
  { sheng: "fare", meaning: "transport money", intent: "transport-related problems", urgency: 'medium', category: 'financial' },
  { sheng: "mat", meaning: "matatu (public transport)", intent: "transport issues", urgency: 'medium', category: 'financial' },
  { sheng: "nganya", meaning: "matatu/vehicle", intent: "transport problems", urgency: 'medium', category: 'financial' },
  { sheng: "hospitali", meaning: "hospital", intent: "medical emergencies", urgency: 'high', category: 'medical' },
  { sheng: "daktari", meaning: "doctor", intent: "medical assistance needed", urgency: 'medium', category: 'medical' },
  { sheng: "dawa", meaning: "medicine", intent: "medical needs", urgency: 'medium', category: 'medical' },
  { sheng: "ugonjwa", meaning: "sickness/disease", intent: "health problems", urgency: 'medium', category: 'medical' },
  { sheng: "mjeraha", meaning: "injured person", intent: "injury-related emergencies", urgency: 'high', category: 'medical' },
  { sheng: "polisi", meaning: "police", intent: "legal troubles or need for protection", urgency: 'medium', category: 'legal' },
  { sheng: "kortini", meaning: "in court", intent: "legal problems", urgency: 'medium', category: 'legal' },
  { sheng: "lawyer", meaning: "legal representative", intent: "legal assistance needed", urgency: 'medium', category: 'legal' },
  { sheng: "case", meaning: "legal case/problem", intent: "legal troubles", urgency: 'medium', category: 'legal' },
  { sheng: "hongo", meaning: "bribe", intent: "corruption-related problems", urgency: 'medium', category: 'legal' },
  { sheng: "kubali", meaning: "to accept/agree", intent: "seeking acceptance or help", urgency: 'low', category: 'support' },
  { sheng: "kataa", meaning: "to refuse/reject", intent: "being rejected or denied", urgency: 'medium', category: 'support' },
  { sheng: "saidia", meaning: "to help", intent: "requesting assistance", urgency: 'medium', category: 'support' },
  { sheng: "msaada", meaning: "help/assistance", intent: "need for support", urgency: 'medium', category: 'support' },
  { sheng: "haraka", meaning: "quickly/urgent", intent: "urgent situations", urgency: 'high', category: 'emergency' },
  { sheng: "shida", meaning: "problem/trouble", intent: "general problems or difficulties", urgency: 'medium', category: 'support' },
  { sheng: "tatizo", meaning: "problem/issue", intent: "problematic situations", urgency: 'medium', category: 'support' },
  { sheng: "ugumu", meaning: "difficulty/hardship", intent: "challenging circumstances", urgency: 'medium', category: 'support' },
  { sheng: "uchungu", meaning: "pain/suffering", intent: "physical or emotional pain", urgency: 'medium', category: 'medical' },
  { sheng: "machozi", meaning: "tears", intent: "emotional distress", urgency: 'medium', category: 'mental_health' },
  { sheng: "huzuni", meaning: "sadness/grief", intent: "emotional support needed", urgency: 'medium', category: 'mental_health' },
  { sheng: "hofu", meaning: "fear", intent: "fear-based crisis situations", urgency: 'medium', category: 'mental_health' },
  { sheng: "wasiwasi", meaning: "worry/anxiety", intent: "anxiety-related concerns", urgency: 'medium', category: 'mental_health' },
  { sheng: "upweke", meaning: "loneliness", intent: "social isolation issues", urgency: 'medium', category: 'mental_health' },
  { sheng: "maskini", meaning: "poor person", intent: "poverty-related problems", urgency: 'medium', category: 'financial' },
  { sheng: "umaskini", meaning: "poverty", intent: "economic hardship", urgency: 'medium', category: 'financial' },
  { sheng: "njaa", meaning: "hunger", intent: "food security issues", urgency: 'medium', category: 'support' },
  { sheng: "chakula", meaning: "food", intent: "food-related needs", urgency: 'medium', category: 'support' },
  { sheng: "maji", meaning: "water", intent: "water access problems", urgency: 'medium', category: 'support' },
  { sheng: "umeme", meaning: "electricity", intent: "utility problems", urgency: 'medium', category: 'support' },
  { sheng: "nyumba", meaning: "house", intent: "housing issues", urgency: 'medium', category: 'shelter' },
  { sheng: "landlord", meaning: "property owner", intent: "landlord-related problems", urgency: 'medium', category: 'shelter' },
  { sheng: "rent", meaning: "house rent", intent: "rental payment problems", urgency: 'medium', category: 'financial' },
  { sheng: "kazi", meaning: "work/job", intent: "employment-related issues", urgency: 'medium', category: 'employment' },
  { sheng: "boss", meaning: "employer/supervisor", intent: "workplace problems", urgency: 'medium', category: 'employment' },
  { sheng: "mshahara", meaning: "salary", intent: "salary-related problems", urgency: 'medium', category: 'financial' },
  { sheng: "deni", meaning: "debt", intent: "debt-related problems", urgency: 'medium', category: 'financial' },
  { sheng: "mkopo", meaning: "loan", intent: "loan-related difficulties", urgency: 'medium', category: 'financial' },
  { sheng: "benki", meaning: "bank", intent: "banking problems", urgency: 'medium', category: 'financial' },
  { sheng: "familia", meaning: "family", intent: "family-related problems", urgency: 'medium', category: 'support' },
  { sheng: "watoto", meaning: "children", intent: "child-related concerns", urgency: 'medium', category: 'support' },
  { sheng: "bibi", meaning: "wife", intent: "marital problems", urgency: 'medium', category: 'support' },
  { sheng: "bwana", meaning: "husband", intent: "marital issues", urgency: 'medium', category: 'support' },
  { sheng: "talaka", meaning: "divorce", intent: "marital breakdown", urgency: 'medium', category: 'legal' },
  { sheng: "shule", meaning: "school", intent: "education-related problems", urgency: 'medium', category: 'education' },
  { sheng: "elimu", meaning: "education", intent: "educational needs", urgency: 'medium', category: 'education' },
  { sheng: "mwalimu", meaning: "teacher", intent: "educational issues", urgency: 'medium', category: 'education' },
  { sheng: "mtihani", meaning: "examination", intent: "academic pressure", urgency: 'medium', category: 'education' },
  { sheng: "adabu", meaning: "punishment/discipline", intent: "disciplinary issues", urgency: 'medium', category: 'support' },
  { sheng: "vibaya", meaning: "bad/badly", intent: "negative situations", urgency: 'medium', category: 'support' },
  { sheng: "mbaya", meaning: "bad/wrong", intent: "problematic conditions", urgency: 'medium', category: 'support' },
  { sheng: "maumivu", meaning: "pain", intent: "pain-related concerns", urgency: 'medium', category: 'medical' },
  { sheng: "harusi", meaning: "wedding", intent: "marriage-related issues", urgency: 'low', category: 'support' },
  { sheng: "mazishi", meaning: "funeral", intent: "death-related matters", urgency: 'medium', category: 'support' },
  { sheng: "maombi", meaning: "prayers/requests", intent: "spiritual or desperate needs", urgency: 'medium', category: 'support' },
  { sheng: "mungu", meaning: "God", intent: "spiritual crisis situations", urgency: 'medium', category: 'mental_health' },
  { sheng: "imani", meaning: "faith", intent: "spiritual support needed", urgency: 'medium', category: 'mental_health' },

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
