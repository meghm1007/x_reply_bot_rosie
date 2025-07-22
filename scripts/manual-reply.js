// Manual reply script - post a single reply to test the mechanism
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = twitterClient.readWrite;

// The real tweet ID from your mention
const TWEET_ID = '1947678735421084044';

// Test prompt with Rosebud link - direct game prompt style
const TEST_PROMPT = `Build a simple word-guessing game where players guess the theme! Start with one-word themes and expand from there.

🎮 Build this game: https://rosebud.ai/?prompt=${encodeURIComponent('Build a simple word-guessing game where players guess the theme! Start with one-word themes and expand from there.')}`;

async function manualReply() {
  console.log('🤖 Manual Reply Test');
  console.log('====================\n');
  
  try {
    console.log(`📝 Replying to tweet: ${TWEET_ID}`);
    console.log(`💬 Reply text: "${TEST_PROMPT}"`);
    console.log(`📏 Character count: ${TEST_PROMPT.length}/280\n`);
    
    // Post the reply
    console.log('📤 Posting reply...');
    const response = await rwClient.v2.reply(TEST_PROMPT, TWEET_ID);
    
    console.log('✅ Reply posted successfully!');
    console.log(`🆔 Reply ID: ${response.data.id}`);
    console.log(`🔗 Reply URL: https://twitter.com/MeghMehta160626/status/${response.data.id}`);
    
    // Save to persistence (optional)
    const { saveRepliedTweet } = require('../src/persistence');
    await saveRepliedTweet(TWEET_ID, response.data.id);
    console.log('💾 Saved to persistence system');
    
  } catch (error) {
    console.error('❌ Failed to post reply:', error.message);
    
    if (error.code === 429) {
      console.log('⏱️ Rate limit hit. Wait 15 minutes and try again.');
    } else if (error.code === 403) {
      console.log('🚫 Permission denied. Check your Twitter app permissions.');
    } else if (error.code === 404) {
      console.log('❓ Tweet not found. It might have been deleted.');
    } else {
      console.log('🔍 Full error:', error);
    }
  }
}

// Run if called directly
if (require.main === module) {
  manualReply().catch(console.error);
}

module.exports = { manualReply }; 