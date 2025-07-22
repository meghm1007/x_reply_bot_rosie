// Test file - Use this to test your bot components safely!
require('dotenv').config();
const { generateGamePrompt, formatThreadForAI, cleanTweetText, testGeminiConnection } = require('./ai-service');
const { getStats, getRecentReplies, hasRepliedToTweet } = require('./persistence');

// Mock thread data for testing
const mockThreadData = [
  {
    id: '1234567890',
    text: 'Just had the most amazing pizza for lunch! 🍕 What\'s your favorite topping?',
    author: { username: 'foodlover123', name: 'Food Lover' },
    created_at: '2024-01-15T12:00:00.000Z'
  },
  {
    id: '1234567891',
    text: '@foodlover123 I\'m a pepperoni person through and through! 🍕',
    author: { username: 'pizzafan', name: 'Pizza Fan' },
    created_at: '2024-01-15T12:05:00.000Z'
  },
  {
    id: '1234567892',
    text: '@foodlover123 @pizzafan Hawaiian pizza is the best! Pineapple forever! 🍍',
    author: { username: 'controversialfood', name: 'Controversial Food Takes' },
    created_at: '2024-01-15T12:10:00.000Z'
  }
];

const mockTechThreadData = [
  {
    id: '2234567890',
    text: 'Working on a new React app and struggling with state management. Any recommendations?',
    author: { username: 'devstudent', name: 'Dev Student' },
    created_at: '2024-01-15T14:00:00.000Z'
  },
  {
    id: '2234567891',
    text: '@devstudent Redux is great for complex apps, but maybe start with Context API?',
    author: { username: 'seniordeveloper', name: 'Senior Dev' },
    created_at: '2024-01-15T14:05:00.000Z'
  }
];

/**
 * Test the AI service with different thread contexts
 */
async function testAIService() {
  console.log('\n🧠 Testing Gemini AI Service...');
  console.log('=' .repeat(50));
  
  try {
    // First test the connection
    console.log('\n🔍 Testing Gemini API connection:');
    const connectionTest = await testGeminiConnection();
    
    if (!connectionTest) {
      console.log('❌ Gemini connection failed. Skipping further AI tests.');
      return;
    }
    
    // Test with food thread
    console.log('\n📝 Testing with food discussion thread:');
    const foodPrompt = await generateGamePrompt(mockThreadData);
    console.log('Generated prompt:', foodPrompt);
    
    // Test with tech thread
    console.log('\n💻 Testing with tech discussion thread:');
    const techPrompt = await generateGamePrompt(mockTechThreadData);
    console.log('Generated prompt:', techPrompt);
    
    // Test with empty context
    console.log('\n❌ Testing with empty context:');
    const emptyPrompt = await generateGamePrompt([]);
    console.log('Generated prompt:', emptyPrompt);
    
  } catch (error) {
    console.error('❌ Gemini AI Service test failed:', error.message);
    console.log('💡 Make sure you have GEMINI_API_KEY in your .env file');
    console.log('💡 Get your API key from: https://makersuite.google.com/app/apikey');
  }
}

/**
 * Test text cleaning functions
 */
function testTextCleaning() {
  console.log('\n🧹 Testing Text Cleaning...');
  console.log('=' .repeat(50));
  
  const testTexts = [
    '@user1 @user2 This is a tweet with mentions',
    'Check out this link: https://example.com/article',
    'Normal tweet without any special content',
    '@bot    Multiple   spaces    everywhere   ',
    'RT @someone: This is a retweet'
  ];
  
  testTexts.forEach(text => {
    const cleaned = cleanTweetText(text);
    console.log(`Original: "${text}"`);
    console.log(`Cleaned:  "${cleaned}"`);
    console.log('---');
  });
}

/**
 * Test thread formatting for AI
 */
function testThreadFormatting() {
  console.log('\n📖 Testing Thread Formatting...');
  console.log('=' .repeat(50));
  
  const formatted = formatThreadForAI(mockThreadData);
  console.log('Formatted thread context:');
  console.log(formatted);
}

/**
 * Test persistence system
 */
async function testPersistence() {
  console.log('\n💾 Testing Persistence System...');
  console.log('=' .repeat(50));
  
  try {
    // Test stats
    const stats = await getStats();
    console.log('Bot statistics:', stats);
    
    // Test recent replies
    const recent = await getRecentReplies(5);
    console.log(`\nRecent ${recent.length} replies:`, recent);
    
    // Test checking if we've replied to a tweet
    const hasReplied = await hasRepliedToTweet('test-tweet-123');
    console.log(`\nHas replied to test-tweet-123: ${hasReplied}`);
    
  } catch (error) {
    console.error('❌ Persistence test failed:', error.message);
  }
}

/**
 * Test environment variables
 */
function testEnvironment() {
  console.log('\n🔧 Testing Environment Setup...');
  console.log('=' .repeat(50));
  
  const requiredEnvVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'GEMINI_API_KEY',
    'BOT_USERNAME'
  ];
  
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? `${value.substring(0, 10)}...` : 'NOT SET';
    
    console.log(`${status} ${varName}: ${displayValue}`);
    
    if (!value) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.log('💡 Copy env.example to .env and fill in your API keys');
  } else {
    console.log('\n✅ All environment variables are set!');
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Rosebud Bot Tests');
  console.log('=' .repeat(50));
  
  // Test environment first
  testEnvironment();
  
  // Test individual components
  testTextCleaning();
  testThreadFormatting();
  await testPersistence();
  
  // Test AI service last (requires API key)
  if (process.env.GEMINI_API_KEY) {
    await testAIService();
  } else {
    console.log('\n⚠️  Skipping AI tests - no Gemini API key found');
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('💡 If everything looks good, you can start the bot with: npm start');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAIService,
  testTextCleaning,
  testThreadFormatting,
  testPersistence,
  testEnvironment,
  runAllTests,
  mockThreadData,
  mockTechThreadData
}; 