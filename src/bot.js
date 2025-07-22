// Main bot file - this is where everything comes together!
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const { generateGamePrompt } = require('./ai-service');
const { saveRepliedTweet, hasRepliedToTweet } = require('./persistence');
const { readFullThread } = require('./thread-reader');
const keepAlive = require('./keep-alive');

// Initialize Twitter client
// Think of this as your "login" to Twitter's systems
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Get the read-write client (allows us to post tweets)
const rwClient = twitterClient.readWrite;

class RosebudBot {
  constructor() {
    this.botUsername = process.env.BOT_USERNAME;
    this.isRunning = false;
    console.log(`🤖 Rosebud Bot initialized for @${this.botUsername}`);
  }

  // Main function that checks for new mentions
  async checkMentions() {
    try {
      console.log('🔍 Checking for new mentions...');
      
      // Get mentions from Twitter API
      // This is like checking your notifications
      const mentions = await rwClient.v2.userMentionTimeline(
        await this.getBotUserId(),
        {
          max_results: 10,
          'tweet.fields': ['conversation_id', 'created_at', 'author_id', 'text'],
          'user.fields': ['username'],
          expansions: ['author_id']
        }
      );

      if (!mentions.data || mentions.data.length === 0) {
        console.log('📭 No new mentions found');
        return;
      }

      console.log(`📬 Found ${mentions.data.length} mentions`);

      // Process each mention
      for (const mention of mentions.data) {
        await this.processMention(mention);
      }

    } catch (error) {
      if (error.code === 429) {
        console.log('⏱️ Rate limit hit. Waiting for reset...');
        const resetTime = new Date(error.rateLimit.reset * 1000);
        console.log(`⏰ Rate limit resets at: ${resetTime.toLocaleTimeString()}`);
        console.log('💡 This is normal for free tier - bot will retry later');
      } else {
        console.error('❌ Error checking mentions:', error.message);
      }
    }
  }

  // Process individual mention
  async processMention(mention) {
    try {
      // Skip if we've already replied to this tweet
      if (await hasRepliedToTweet(mention.id)) {
        console.log(`⏭️ Already replied to tweet ${mention.id}`);
        return;
      }

      console.log(`📝 Processing mention: "${mention.text}"`);

      // Read the full conversation thread
      const threadContext = await readFullThread(mention.conversation_id);
      console.log(`📖 Read thread with ${threadContext.length} tweets`);

      // Generate a game prompt using AI
      const gamePrompt = await generateGamePrompt(threadContext);
      
      if (!gamePrompt) {
        console.log('❌ Failed to generate game prompt');
        return;
      }

      // Reply to the mention
      await this.replyToTweet(mention.id, gamePrompt);
      
      // Save that we replied to avoid duplicates
      await saveRepliedTweet(mention.id);
      
      console.log(`✅ Successfully replied to ${mention.id}`);

    } catch (error) {
      console.error(`❌ Error processing mention ${mention.id}:`, error);
    }
  }

  // Reply to a tweet with our game prompt
  async replyToTweet(tweetId, gamePrompt) {
    try {
      const response = await rwClient.v2.reply(gamePrompt, tweetId);
      console.log(`💬 Posted reply: ${response.data.id}`);
      return response;
    } catch (error) {
      console.error('❌ Error posting reply:', error);
      throw error;
    }
  }

  // Get our bot's user ID (needed for API calls)
  async getBotUserId() {
    if (!this.userId) {
      const user = await rwClient.v2.userByUsername(this.botUsername);
      this.userId = user.data.id;
    }
    return this.userId;
  }

  // Start the bot
  start() {
    if (this.isRunning) {
      console.log('🤖 Bot is already running!');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Rosebud Bot...');

    // Run immediately on start
    this.checkMentions();

    // Schedule to run every 15 minutes (respects Twitter rate limits)
    // Cron syntax: minute hour day month dayOfWeek
    const interval = process.env.POLL_INTERVAL_MINUTES || 15;
    cron.schedule(`*/${interval} * * * *`, () => {
      this.checkMentions();
    });

    console.log(`⏰ Bot scheduled to check mentions every ${interval} minutes`);
  }

  // Stop the bot
  stop() {
    this.isRunning = false;
    console.log('🛑 Bot stopped');
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  // Start keep-alive server for Replit
  keepAlive();
  
  const bot = new RosebudBot();
  bot.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot...');
    bot.stop();
    process.exit(0);
  });
}

module.exports = RosebudBot; 