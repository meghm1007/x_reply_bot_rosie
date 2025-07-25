// Test file for evaluating AI response quality with sample tweets
require('dotenv').config();
const { generateGamePrompt } = require('./src/ai-service');

// Sample tweets covering various scenarios to test AI response quality
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
    description: "Weather complaint",
    threadContext: [
      {
        id: "1",
        text: "It's been raining for 5 days straight and I'm losing my mind 🌧️",
        author: { username: "rainyhater", name: "Weather Watcher" },
        created_at: "2024-03-15T14:00:00Z"
      }
    ]
  },
  {
    id: "test4",
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
    id: "test5",
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
    id: "test6",
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
  },
  {
    id: "test7",
    description: "Work from home struggles",
    threadContext: [
      {
        id: "1",
        text: "Working from home sounds great until your cat decides your keyboard is the perfect napping spot during your most important meeting 🐱💻",
        author: { username: "remoteworker", name: "Home Office Hero" },
        created_at: "2024-03-11T11:00:00Z"
      }
    ]
  },
  {
    id: "test8",
    description: "Gaming nostalgia",
    threadContext: [
      {
        id: "1",
        text: "Remember when games came with actual instruction manuals and cheat codes? Those were the days... 🎮📖",
        author: { username: "oldschoolgamer", name: "Retro Gamer" },
        created_at: "2024-03-16T20:00:00Z"
      }
    ]
  },
  {
    id: "test9", 
    description: "Gym motivation",
    threadContext: [
      {
        id: "1",
        text: "Day 1 of going to the gym: motivated 💪\nDay 2: still motivated 💪\nDay 3: maybe tomorrow 😅\nDay 4: gym membership = expensive subscription",
        author: { username: "fitnessfail", name: "Gym Newbie" },
        created_at: "2024-03-17T07:00:00Z"
      }
    ]
  },
  {
    id: "test10",
    description: "Social media break",
    threadContext: [
      {
        id: "1",
        text: "Taking a social media detox for a week. See you on the other side! 👋",
        author: { username: "digitaldetox", name: "Mindful User" },
        created_at: "2024-03-18T12:00:00Z"
      },
      {
        id: "2",
        text: "...posted 3 hours ago",
        author: { username: "friend", name: "Observant Friend" },
        created_at: "2024-03-18T15:00:00Z"
      }
    ]
  },
  {
    id: "test11",
    description: "Procrastination struggle",
    threadContext: [
      {
        id: "1",
        text: "I have 5 assignments due tomorrow and I'm here organizing my Spotify playlists. This is fine. 🎵📚",
        author: { username: "student", name: "Stressed Student" },
        created_at: "2024-03-19T23:00:00Z"
      }
    ]
  },
  {
    id: "test12",
    description: "Cooking disaster",
    threadContext: [
      {
        id: "1",
        text: "Tried to make a simple pasta dish. Somehow managed to burn water. How is that even possible? 🍝🔥",
        author: { username: "kitchenfail", name: "Cooking Novice" },
        created_at: "2024-03-20T18:30:00Z"
      }
    ]
  },
  {
    id: "test13",
    description: "Phone battery anxiety",
    threadContext: [
      {
        id: "1",
        text: "My phone is at 23% and I forgot my charger. The panic is real 📱🔋",
        author: { username: "lowbattery", name: "Phone Dependent" },
        created_at: "2024-03-21T14:45:00Z"
      }
    ]
  },
  {
    id: "test14",
    description: "AI taking over jobs",
    threadContext: [
      {
        id: "1",
        text: "AI can now write code, create art, and compose music. At this rate, the only job left will be teaching AI how to be human 🤖",
        author: { username: "techwatcher", name: "Future Thinker" },
        created_at: "2024-03-22T09:15:00Z"
      }
    ]
  },
  {
    id: "test15",
    description: "Netflix decision paralysis",
    threadContext: [
      {
        id: "1",
        text: "Spent 45 minutes scrolling through Netflix just to watch The Office again. Why am I like this? 📺",
        author: { username: "netflixaddict", name: "Binge Watcher" },
        created_at: "2024-03-23T21:00:00Z"
      }
    ]
  },
  {
    id: "test16",
    description: "Healthy eating fails",
    threadContext: [
      {
        id: "1",
        text: "Bought a salad for lunch to be healthy. Also bought a donut 'for later'. Guess which one I ate first? 🥗🍩",
        author: { username: "healthyish", name: "Diet Struggler" },
        created_at: "2024-03-24T12:30:00Z"
      }
    ]
  },
  {
    id: "test17",
    description: "Parking problems",
    threadContext: [
      {
        id: "1",
        text: "Circled the parking lot 6 times. Finally found a spot. It's a 10-minute walk to the store. This is why I shop online 🚗🏪",
        author: { username: "parkingfail", name: "Mall Visitor" },
        created_at: "2024-03-25T15:20:00Z"
      }
    ]
  },
  {
    id: "test18",
    description: "Password frustration",
    threadContext: [
      {
        id: "1",
        text: "Website: 'Your password must be 12 characters with special symbols'\nAlso website: 'Your password cannot contain special symbols'\nMe: 🤯",
        author: { username: "passwordrage", name: "Security Sufferer" },
        created_at: "2024-03-26T10:45:00Z"
      }
    ]
  },
  {
    id: "test19",
    description: "Sleep schedule chaos",
    threadContext: [
      {
        id: "1",
        text: "Me at 11 PM: I should go to bed early tonight\nMe at 3 AM: Just one more YouTube video about how penguins sleep 🐧😴",
        author: { username: "nightowl", name: "Insomniac" },
        created_at: "2024-03-27T03:00:00Z"
      }
    ]
  },
  {
    id: "test20",
    description: "Monday motivation",
    threadContext: [
      {
        id: "1",
        text: "Monday motivation: Coffee ☕\nTuesday motivation: More coffee ☕☕\nWednesday motivation: Is it Friday yet? 📅",
        author: { username: "weekdaywarrior", name: "Office Worker" },
        created_at: "2024-03-28T08:00:00Z"
      }
    ]
  }
];

/**
 * Test the AI service with sample tweets and display results
 */
async function runTestSuite() {
  console.log('🧪 Starting AI Response Quality Test Suite\n');
  console.log('=' + '='.repeat(80));
  
  const results = [];
  
  for (let i = 0; i < sampleTweets.length; i++) {
    const testCase = sampleTweets[i];
    console.log(`\n📝 Test ${i + 1}/${sampleTweets.length}: ${testCase.description}`);
    console.log('-'.repeat(50));
    
    // Display original tweet context
    console.log('📱 Original Tweet(s):');
    testCase.threadContext.forEach((tweet, index) => {
      console.log(`   ${index + 1}. @${tweet.author.username}: "${tweet.text}"`);
    });
    
    try {
      // Generate game prompt
      const gamePrompt = await generateGamePrompt(testCase.threadContext);
      
      console.log('🎮 Generated Game Prompt:');
      console.log(`   "${gamePrompt}"`);
      console.log(`   📏 Length: ${gamePrompt.length} characters`);
      
      // Store result for analysis
      results.push({
        id: testCase.id,
        description: testCase.description,
        originalTweet: testCase.threadContext[0].text,
        generatedPrompt: gamePrompt,
        promptLength: gamePrompt.length,
        success: true
      });
      
      // Brief pause between requests to be API-friendly
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log('❌ Error generating prompt:', error.message);
      results.push({
        id: testCase.id,
        description: testCase.description,
        originalTweet: testCase.threadContext[0].text,
        generatedPrompt: null,
        error: error.message,
        success: false
      });
    }
    
    console.log('=' + '='.repeat(80));
  }
  
  // Display summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=' + '='.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (successful > 0) {
    const avgLength = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.promptLength, 0) / successful;
    console.log(`📏 Average prompt length: ${Math.round(avgLength)} characters`);
  }
  
  // Display quality analysis
  console.log('\n🎯 QUALITY ANALYSIS');
  console.log('-'.repeat(50));
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`\n${index + 1}. ${result.description}`);
      console.log(`   Original: "${result.originalTweet.substring(0, 60)}..."`);
      console.log(`   Generated: "${result.generatedPrompt}"`);
      
      // Simple quality indicators
      const hasGameElements = /game|play|build|create|design|level|score|challenge/i.test(result.generatedPrompt);
      const isContextual = result.generatedPrompt.toLowerCase().includes(
        result.originalTweet.toLowerCase().split(' ').find(word => word.length > 4) || ''
      );
      const withinLimit = result.promptLength <= 280;
      
      console.log(`   🎮 Game elements: ${hasGameElements ? '✅' : '❌'}`);
      console.log(`   🎯 Contextual: ${isContextual ? '✅' : '❌'}`);
      console.log(`   📏 Within limit: ${withinLimit ? '✅' : '❌'}`);
    }
  });
  
  return results;
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  runTestSuite()
    .then(() => {
      console.log('\n🏁 Test suite completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  sampleTweets,
  runTestSuite
}; 