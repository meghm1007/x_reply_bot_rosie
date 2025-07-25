// Short test file for quick evaluation of AI response quality
require('dotenv').config();
const { generateGamePrompt } = require('./src/ai-service');

// Just the first 5 sample tweets for quick testing
const sampleTweets = [
  {
    id: "test1",
    description: "Tech complaint about X platform",
    threadContext: [
      {
        id: "1",
        text: "X has been crazy today\n-not loading on browser\n-cant see messages\n-logged me out twice\n😤",
        author: { username: "itsthemeg", name: "Megh" },
        created_at: "2024-03-10T10:00:00Z"
      }
    ]
  },
  {
    id: "test2",
    description: "Sports comparison discussion",
    threadContext: [
      {
        id: "1",
        text: "i hope squash becomes as famous as pickleball",
        author: { username: "itsthemeg", name: "Megh" },
        created_at: "2024-06-25T10:00:00Z"
      },
      {
        id: "2", 
        text: "having played all three squash, pickleball and tennis\n\n> squash is the fastest, and the most demanding/tiring\n>tennis is glorified\n>pickleball just sucks (too bad at tennis, too poor for golf)\n\nsquash is the king of racket sports👑",
        author: { username: "itsthemeg", name: "Megh" },
        created_at: "2024-06-25T10:01:00Z"
      }
    ]
  },
  {
    id: "test3",
    description: "Coffee addiction",
    threadContext: [
      {
        id: "1", 
        text: "I literally cannot function without my morning coffee. Had to skip it today and I'm basically a zombie ☕",
        author: { username: "coffeeaddict", name: "Java Lover" },
        created_at: "2024-03-12T08:00:00Z"
      }
    ]
  },
  {
    id: "test4",
    description: "Traffic frustration",
    threadContext: [
      {
        id: "1",
        text: "Stuck in traffic for 2 hours because of construction. Why do they always work during rush hour?? 🚗💢",
        author: { username: "commuter", name: "Daily Driver" },
        created_at: "2024-03-14T17:30:00Z"
      }
    ]
  },
  {
    id: "test5",
    description: "Food debate - pineapple pizza",
    threadContext: [
      {
        id: "1",
        text: "Pineapple on pizza is actually amazing and I'm tired of pretending it's not 🍍🍕",
        author: { username: "pizzalover", name: "Food Critic" },
        created_at: "2024-03-13T19:00:00Z"
      },
      {
        id: "2",
        text: "This is heresy and you know it",
        author: { username: "purist", name: "Pizza Purist" },
        created_at: "2024-03-13T19:01:00Z"
      }
    ]
  }
];

async function runShortTest() {
  console.log('🧪 Running Short AI Test Suite (5 samples)\n');
  
  const results = [];
  
  for (let i = 0; i < sampleTweets.length; i++) {
    const testCase = sampleTweets[i];
    console.log(`\n📝 Test ${i + 1}: ${testCase.description}`);
    console.log('-'.repeat(60));
    
    // Display original tweet
    const originalTweet = testCase.threadContext[0].text;
    console.log(`📱 Original: "${originalTweet.substring(0, 80)}..."`);
    
    try {
      const gamePrompt = await generateGamePrompt(testCase.threadContext);
      console.log(`🎮 Generated: "${gamePrompt}"`);
      console.log(`📏 Length: ${gamePrompt.length} chars`);
      
      // Quality check
      const hasGameWords = /build|create|design|make|game/i.test(gamePrompt);
      const isContextual = gamePrompt.toLowerCase().includes(
        originalTweet.toLowerCase().split(' ').filter(w => w.length > 4)[0] || ''
      );
      
      console.log(`✅ Quality: Game=${hasGameWords ? '✓' : '✗'} Context=${isContextual ? '✓' : '✗'} Length=${gamePrompt.length <= 180 ? '✓' : '✗'}`);
      
      results.push({ success: true, prompt: gamePrompt, length: gamePrompt.length });
      
      // Pause between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({ success: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Success rate: ${successful}/${results.length}`);
  
  if (successful > 0) {
    const avgLength = results.filter(r => r.success).reduce((sum, r) => sum + r.length, 0) / successful;
    console.log(`📏 Average length: ${Math.round(avgLength)} characters`);
  }
}

if (require.main === module) {
  runShortTest()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
} 