
// Sample intents for testing - these are now stored in the database
// This file serves as documentation for the intent structure

export const sampleIntents = [
  {
    intent_key: 'shelter_need',
    category: 'basic_service',
    keywords: {
      english: ['shelter', 'place to sleep', 'sleep tonight', 'homeless', 'cold', 'nowhere to go', 'need accommodation', 'housing', 'room', 'bed'],
      swahili: ['mahali pa kulala', 'kulala leo usiku', 'makazi', 'baridi', 'sina pa kulala', 'nyumba', 'chumba'],
      sheng: ['base', 'place ya kulala', 'kulala', 'niko baridi'],
      arabic: ['مأوى', 'مكان للنوم', 'بارد', 'بيت']
    },
    response_template: {
      english: "I'm so sorry you're going through this. You deserve a safe, warm place to sleep. Let me help you find emergency shelter near you right away. Can you tell me your location or the area you're in? You're not alone in this.",
      swahili: "Pole sana kwa hali hii ngumu. Unastahili mahali salama pa kulala. Niruhusu nikusaidie kupata makazi ya dharura karibu nawe. Unaweza kuniambia uko wapi? Haumo peke yako.",
      sheng: "Pole sana bro. Haupaswa kulala nje. Nitakusort na place ya emergency karibu nawe. Niambie tu uko area gani? Tutakusaidia.",
      arabic: "أنا آسف جداً لما تمرين به. تستحقين مكاناً آمناً ودافئاً للنوم. دعيني أساعدك في العثور على مأوى طارئ بالقرب منك. هل يمكنك إخباري بموقعك؟"
    }
  },
  {
    intent_key: 'food_need',
    category: 'basic_service',
    keywords: {
      english: ['food', 'hungry', 'starving', 'eat', 'meal', 'nothing to eat', 'no money for food', 'feed my children', 'nutrition'],
      swahili: ['chakula', 'njaa', 'nina njaa', 'kula', 'mlo', 'sina chakula', 'sina pesa ya chakula', 'kulisha watoto'],
      sheng: ['food', 'njaa', 'dishi', 'kula', 'starve'],
      arabic: ['طعام', 'جوعان', 'أكل', 'وجبة', 'أطفال جوعى']
    },
    response_template: {
      english: "I understand how hard it is to go without food, especially when you have children depending on you. Let me find food assistance near you right now. Can you share your location so I can connect you with the closest food bank or meal program? Help is available today.",
      swahili: "Naelewa jinsi ni ngumu kukosa chakula, hasa ukiwa na watoto wanaotegemea wewe. Niruhusu nikutafutie msaada wa chakula karibu nawe sasa. Unaweza kushare location yako ili niweze kukuunganisha na chakula cha karibu? Msaada unapatikana leo.",
      sheng: "Najua ni hard kukosa food, especially na watoto. Nitakutafutia food assistance karibu nawe sasa. Share location yako nikuconnect na food bank ya karibu. Tutakusaidia leo.",
      arabic: "أفهم كم هو صعب البقاء دون طعام، خاصة عندما يعتمد عليك الأطفال. دعيني أجد مساعدة غذائية بالقرب منك الآن. هل يمكنك مشاركة موقعك؟"
    }
  }
  // Additional intents are now in the database...
];

// Function to seed the database with sample intents (now deprecated)
export const seedIntents = async () => {
  console.log('Sample intents are now managed directly in the database via SQL migrations');
  console.log('See the chatbot_intents table for current intent definitions');
};
