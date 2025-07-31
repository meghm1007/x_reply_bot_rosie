// Test script for Gemini 2.5 Pro with realistic sample tweets
require('dotenv').config();
const { generateGamePrompt } = require('./src/ai-service');

// Realistic sample tweets/threads that would occur in real life
const SAMPLE_SCENARIOS = [
  {
    id: "random_game_request",
    description: "User asks for a random game",
    threadContext: [
      {
        id: "1",
        text: "@rosebud_x_bot make me a random game please!",
        author: { username: "gamedev_sara", name: "Sara" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "work_frustration",
    description: "Work frustration thread",
    threadContext: [
      {
        id: "1",
        text: "Another Monday morning... coffee machine is broken and I have 3 deadlines today 😩",
        author: { username: "stressed_dev", name: "Mike" },
        created_at: new Date().toISOString()
      },
      {
        id: "2", 
        text: "Same here! Why does everything break on Mondays? @rosebud_x_bot",
        author: { username: "office_jane", name: "Jane" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "tech_problems",
    description: "Tech debugging nightmare",
    threadContext: [
      {
        id: "1",
        text: "Been debugging this JavaScript error for 4 hours... it's a missing semicolon 🤦‍♂️",
        author: { username: "frustrated_coder", name: "Alex" },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        text: "The classic! @rosebud_x_bot turn this pain into something fun",
        author: { username: "debugging_buddy", name: "Sam" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "food_debate",
    description: "Heated food debate",
    threadContext: [
      {
        id: "1",
        text: "Pineapple on pizza is amazing and I will fight anyone who disagrees 🍍🍕",
        author: { username: "pineapple_warrior", name: "Emma" },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        text: "This is culinary heresy! @rosebud_x_bot help us settle this",
        author: { username: "pizza_purist", name: "Tony" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "social_media_detox",
    description: "Social media addiction struggles",
    threadContext: [
      {
        id: "1",
        text: "Trying to quit social media but here I am scrolling at 2am again... 📱😴",
        author: { username: "night_scroller", name: "Riley" },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        text: "The algorithm knows us too well @rosebud_x_bot make something about this endless scroll",
        author: { username: "scroll_survivor", name: "Casey" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "weather_complaints",
    description: "Weather frustrations",
    threadContext: [
      {
        id: "1",
        text: "It's been raining for 2 weeks straight... I forgot what the sun looks like ☔😭",
        author: { username: "rain_victim", name: "Jordan" },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        text: "@rosebud_x_bot turn this gloomy weather into game magic!",
        author: { username: "weather_watcher", name: "Morgan" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "fitness_motivation",
    description: "Gym motivation struggles",
    threadContext: [
      {
        id: "1",
        text: "Day 3 of telling myself I'll start working out tomorrow... 🏋️‍♀️💪",
        author: { username: "couch_potato", name: "Taylor" },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        text: "We need gamification for everything! @rosebud_x_bot help us get motivated",
        author: { username: "fitness_dreamer", name: "Avery" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "traffic_nightmare",
    description: "Traffic and commute issues",
    threadContext: [
      {
        id: "1",
        text: "Stuck in traffic for 2 hours... this 20-minute commute has become a daily nightmare 🚗🚦",
        author: { username: "commuter_hell", name: "Jamie" },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        text: "@rosebud_x_bot make traffic fun somehow? Is that even possible?",
        author: { username: "road_warrior", name: "Parker" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "creative_block",
    description: "Creative burnout and writer's block", 
    threadContext: [
      {
        id: "1",
        text: "Staring at a blank canvas for 3 hours... where did all my creativity go? 🎨😶",
        author: { username: "blocked_artist", name: "Sage" },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        text: "Creative block is the worst! @rosebud_x_bot inspire us with something completely new",
        author: { username: "creative_soul", name: "River" },
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "minimal_context",
    description: "Very minimal context - just a mention",
    threadContext: [
      {
        id: "1",
        text: "Hey @rosebud_x_bot!",
        author: { username: "mystery_user", name: "Anonymous" },
        created_at: new Date().toISOString()
      }
    ]
  }
];

/**
 * Format the test output in a systematic way
 */
function formatTestOutput(scenario, gamePrompt, timing) {
  const separator = "=".repeat(80);
  const subseparator = "-".repeat(40);
  
  console.log(`\n${separator}`);
  console.log(`🧪 TEST SCENARIO: ${scenario.id.toUpperCase()}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log(`${separator}\n`);
  
  console.log(`${subseparator}`);
  console.log("📱 ORIGINAL THREAD:");
  console.log(`${subseparator}`);
  
  scenario.threadContext.forEach((tweet, index) => {
    console.log(`${index + 1}. @${tweet.author.username}: "${tweet.text}"`);
  });
  
  console.log(`\n${subseparator}`);
  console.log("🤖 BOT RESPONSE:");
  console.log(`${subseparator}`);
  console.log(`"${gamePrompt}"`);
  
  console.log(`\n${subseparator}`);
  console.log("📊 ANALYSIS:");
  console.log(`${subseparator}`);
  console.log(`⏱️  Generation Time: ${timing}ms`);
  console.log(`📏 Response Length: ${gamePrompt.length} characters`);
  console.log(`🎯 Context Used: ${scenario.threadContext.length} tweet(s)`);
  
  // Calculate final Twitter post length (with Rosebud link)
  const encodedPrompt = encodeURIComponent(gamePrompt);
  const rosebudUrl = `https://rosebud.ai/?prompt=${encodedPrompt}`;
  const fullTweetLength = `${gamePrompt}\n\nBuild this game: ${rosebudUrl}`.length;
  console.log(`📱 Full Tweet Length: ${fullTweetLength}/280 characters`);
  
  if (fullTweetLength > 280) {
    console.log(`⚠️  WARNING: Tweet would exceed 280 character limit!`);
  }
  
  // Analyze creativity markers
  const creativityMarkers = [
    { marker: "unique concept", present: /build a|create a|design a|make a/i.test(gamePrompt) },
    { marker: "emoji-free", present: !/[\u{1F300}-\u{1F9FF}]/u.test(gamePrompt) },
    { marker: "action verb", present: /^(build|create|design|make)/i.test(gamePrompt) },
    { marker: "simple language", present: !/[^\w\s.,!?'-]/g.test(gamePrompt) },
    { marker: "Twitter limit OK", present: fullTweetLength <= 280 },
    { marker: "context reference", present: scenario.threadContext.some(tweet => {
      const keywords = tweet.text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      return keywords.some(keyword => gamePrompt.toLowerCase().includes(keyword.replace(/[^a-z]/g, '')));
    })}
  ];
  
  console.log(`🎨 Creativity Markers:`);
  creativityMarkers.forEach(marker => {
    console.log(`   ${marker.present ? '✅' : '❌'} ${marker.marker}`);
  });
  
  console.log(`\n${separator}\n`);
}

/**
 * Run all test scenarios
 */
async function runAllTests() {
  console.log(`
🚀 GEMINI 2.5 PRO TESTING SUITE
🤖 Testing Rosebud AI Bot Responses
⚡ Enhanced Creativity & Context Awareness
`);
  
  console.log(`📋 Running ${SAMPLE_SCENARIOS.length} test scenarios...\n`);
  
  for (let i = 0; i < SAMPLE_SCENARIOS.length; i++) {
    const scenario = SAMPLE_SCENARIOS[i];
    
    try {
      console.log(`🔄 Processing test ${i + 1}/${SAMPLE_SCENARIOS.length}: ${scenario.id}`);
      
      const startTime = Date.now();
      const gamePrompt = await generateGamePrompt(scenario.threadContext);
      const endTime = Date.now();
      const timing = endTime - startTime;
      
      formatTestOutput(scenario, gamePrompt, timing);
      
      // Small delay between tests to be gentle on the API
      if (i < SAMPLE_SCENARIOS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Error in test ${scenario.id}:`, error);
      console.log(`\n${"=".repeat(80)}\n`);
    }
  }
  
  console.log(`✅ Completed all ${SAMPLE_SCENARIOS.length} test scenarios!`);
  console.log(`\n🎯 This test demonstrates:`);
  console.log(`   • Context awareness across different scenarios`);
  console.log(`   • Creative responses to varied situations`);
  console.log(`   • Handling of minimal vs rich context`);
  console.log(`   • Response time and reliability`);
  console.log(`   • Gemini 2.5 Pro's enhanced capabilities\n`);
}

/**
 * Run a specific test by ID
 */
async function runSpecificTest(testId) {
  const scenario = SAMPLE_SCENARIOS.find(s => s.id === testId);
  
  if (!scenario) {
    console.error(`❌ Test scenario '${testId}' not found!`);
    console.log(`Available scenarios: ${SAMPLE_SCENARIOS.map(s => s.id).join(', ')}`);
    return;
  }
  
  console.log(`🎯 Running specific test: ${testId}\n`);
  
  try {
    const startTime = Date.now();
    const gamePrompt = await generateGamePrompt(scenario.threadContext);
    const endTime = Date.now();
    const timing = endTime - startTime;
    
    formatTestOutput(scenario, gamePrompt, timing);
    
  } catch (error) {
    console.error(`❌ Error in test ${testId}:`, error);
  }
}

// Export for use in other scripts
module.exports = {
  SAMPLE_SCENARIOS,
  runAllTests,
  runSpecificTest,
  formatTestOutput
};

// Run tests if this file is executed directly
if (require.main === module) {
  const testId = process.argv[2];
  
  if (testId) {
    runSpecificTest(testId);
  } else {
    runAllTests();
  }
}