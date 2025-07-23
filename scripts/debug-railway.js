// Railway debugging script - tests Twitter API authentication
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

console.log('🔧 Railway Debug - Environment Check');
console.log('=====================================');

// Check environment variables
const requiredVars = [
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET', 
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'BOT_USERNAME'
];

let allVarsSet = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 10)}...` : 'NOT SET';
  console.log(`${status} ${varName}: ${display}`);
  if (!value) allVarsSet = false;
});

if (!allVarsSet) {
  console.log('\n❌ Missing environment variables on Railway!');
  console.log('💡 Go to Railway dashboard → Variables tab → Add missing vars');
  process.exit(1);
}

console.log('\n🔍 Testing Twitter API Authentication...');

// Initialize Twitter client (same as in bot.js)
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = twitterClient.readWrite;

async function testAuth() {
  try {
    // Test 1: Get our own user info (low-rate-limit call)
    console.log('🧪 Test 1: Getting bot user info...');
    const user = await rwClient.v2.userByUsername(process.env.BOT_USERNAME);
    console.log(`✅ Bot user found: @${user.data.username} (ID: ${user.data.id})`);
    
    // Test 2: Try to get mentions (this is what's failing)
    console.log('🧪 Test 2: Checking mentions access...');
    const mentions = await rwClient.v2.userMentionTimeline(user.data.id, {
      max_results: 5,
      'tweet.fields': ['created_at', 'author_id']
    });
    
    console.log('✅ Mentions API call successful!');
    console.log(`📬 Response type: ${typeof mentions}`);
    
    const actualData = mentions._realData || mentions;
    if (actualData.data && actualData.data.length > 0) {
      console.log(`📬 Found ${actualData.data.length} recent mentions`);
    } else {
      console.log('📭 No recent mentions found (this is normal)');
    }
    
    console.log('\n🎉 All tests passed! Your Twitter API auth is working on Railway!');
    
  } catch (error) {
    console.error('\n❌ Authentication test failed!');
    console.error('🔍 Error code:', error.code);
    console.error('🔍 Error message:', error.message);
    
    if (error.code === 401) {
      console.log('\n🔧 How to fix 401 Unauthorized:');
      console.log('1. Check Railway environment variables are set correctly');
      console.log('2. Regenerate Twitter Access Token & Secret');
      console.log('3. Make sure app permissions are "Read and write"');
    } else if (error.code === 403) {
      console.log('\n🔧 How to fix 403 Forbidden:');
      console.log('1. Check app permissions in Twitter Developer portal');
      console.log('2. Make sure app type is "Web App, Automated App or Bot"');
    } else if (error.code === 429) {
      console.log('\n⏱️ Rate limit hit - this actually means auth is working!');
      console.log('🎉 Your credentials are valid, just hit the rate limit');
    }
    
    process.exit(1);
  }
}

testAuth(); 