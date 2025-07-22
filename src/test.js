// Test file - Use this to test your bot components safely!
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const { generateGamePrompt, formatThreadForAI, cleanTweetText, testGeminiConnection } = require('./ai-service');
const { getStats, getRecentReplies, hasRepliedToTweet } = require('./persistence');

// Initialize Twitter client for testing
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = twitterClient.readWrite;

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
 * Test Twitter API connection and permissions
 */
async function testTwitterAPI() {
  console.log('\n🐦 Testing Twitter API Connection...');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Check if we can authenticate
    console.log('🔐 Testing authentication...');
    const me = await rwClient.v2.me();
    console.log(`✅ Authenticated as: @${me.data.username} (${me.data.name})`);
    
    // Test 2: Check bot username matches
    const botUsername = process.env.BOT_USERNAME;
    if (me.data.username.toLowerCase() === botUsername.toLowerCase()) {
      console.log('✅ Bot username matches authenticated account');
    } else {
      console.log(`⚠️  Bot username mismatch! Expected: @${botUsername}, Got: @${me.data.username}`);
    }
    
    // Test 3: Try to get mentions (this is what's failing)
    console.log('📬 Testing mentions API...');
    const mentions = await rwClient.v2.userMentionTimeline(me.data.id, {
      max_results: 5,
      'tweet.fields': ['conversation_id', 'created_at', 'author_id', 'text'],
      'user.fields': ['username'],
      expansions: ['author_id']
    });
    
    console.log('🔍 Mentions API response structure:');
    console.log('- Has data property:', mentions.hasOwnProperty('data'));
    console.log('- Data type:', typeof mentions.data);
    console.log('- Data value:', mentions.data);
    console.log('- Has meta property:', mentions.hasOwnProperty('meta'));
    console.log('- Meta:', mentions.meta);
    
    if (mentions.data && Array.isArray(mentions.data)) {
      console.log(`✅ Found ${mentions.data.length} mentions`);
      if (mentions.data.length > 0) {
        console.log('📝 Sample mention:', {
          id: mentions.data[0].id,
          text: mentions.data[0].text.substring(0, 50) + '...',
          author_id: mentions.data[0].author_id
        });
      }
    } else if (!mentions.data) {
      console.log('ℹ️  No mentions found (this is normal if you haven\'t been mentioned recently)');
    }
    
    console.log('✅ Twitter API connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Twitter API test failed:', error.message);
    
    if (error.code === 401) {
      console.log('💡 Authentication failed. Check your Twitter API credentials:');
      console.log('   - API Key and Secret');
      console.log('   - Access Token and Secret');
      console.log('   - Make sure tokens match the same app');
    } else if (error.code === 403) {
      console.log('💡 Permission denied. Make sure your Twitter app has:');
      console.log('   - Read and Write permissions');
      console.log('   - User authentication settings enabled');
    } else if (error.code === 429) {
      console.log('💡 Rate limit hit. This is normal - wait 15 minutes and try again');
    } else {
      console.log('🔍 Full error details:', error);
    }
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
  
  // Test Twitter API connection
  await testTwitterAPI();
  
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
  testTwitterAPI,
  runAllTests,
  mockThreadData,
  mockTechThreadData
}; 