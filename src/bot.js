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

      // Debug: Log the response structure
      console.log('🔍 Debug - API Response type:', typeof mentions);
      console.log('🔍 Debug - Has _realData:', mentions._realData ? 'YES' : 'NO');
      
      // Extract the actual data from the response
      const actualData = mentions._realData || mentions;
      const mentionsData = actualData.data;
      const mentionsMeta = actualData.meta;

      // Better error handling for undefined or missing data
      if (!actualData) {
        console.log('❌ API returned no response data');
        return;
      }

      if (!mentionsData) {
        console.log('📭 No mentions data in response (this might be normal if no mentions exist)');
        console.log('📊 Response meta:', mentionsMeta);
        return;
      }

      if (!Array.isArray(mentionsData)) {
        console.log('❌ Mentions data is not an array:', typeof mentionsData);
        console.log('🔍 Raw data:', mentionsData);
        return;
      }

      if (mentionsData.length === 0) {
        console.log('📭 No new mentions found');
        return;
      }

      console.log(`📬 Found ${mentionsData.length} mentions`);

      // Process each mention
      for (const mention of mentionsData) {
        await this.processMention(mention, actualData.includes);
      }

    } catch (error) {
      if (error.code === 429) {
        console.log('⏱️ Rate limit hit. Waiting for reset...');
        const resetTime = new Date(error.rateLimit.reset * 1000);
        console.log(`⏰ Rate limit resets at: ${resetTime.toLocaleTimeString()}`);
        console.log('💡 This is normal for free tier - bot will retry later');
        // Don't exit, just continue with normal schedule
      } else {
        console.error('❌ Error checking mentions:', error.message);
        console.error('🔍 Full error details:', error);
      }
    }
  }

  // Process individual mention
  async processMention(mention, includes) {
    try {
      // Skip if we've already replied to this tweet
      if (await hasRepliedToTweet(mention.id)) {
        console.log(`⏭️ Already replied to tweet ${mention.id}`);
        return;
      }

      // IMPORTANT: Only process tweets from the past 15 minutes (or configured time window)
      const tweetTime = new Date(mention.created_at);
      const now = new Date();
      const timeWindowMinutes = parseInt(process.env.POLL_INTERVAL_MINUTES) || 15;
      const timeWindowAgo = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);
      
      if (tweetTime < timeWindowAgo) {
        console.log(`⏰ Skipping old tweet ${mention.id} (created ${tweetTime.toLocaleTimeString()}, older than ${timeWindowMinutes} minutes)`);
        return;
      }
      
      console.log(`✅ Tweet ${mention.id} is recent (created ${tweetTime.toLocaleTimeString()}, within ${timeWindowMinutes} minutes)`);

      // Get author info from includes
      const author = includes?.users?.find(user => user.id === mention.author_id);
      const authorName = author ? `@${author.username}` : 'someone';
      
      // CRITICAL: Check if the bot is actually mentioned in this tweet
      const botMentioned = mention.text.toLowerCase().includes(`@${this.botUsername.toLowerCase()}`);
      if (!botMentioned) {
        console.log(`⏭️ Bot not actually mentioned in tweet ${mention.id}: "${mention.text}"`);
        return;
      }
      
      console.log(`📝 Processing mention from ${authorName}: "${mention.text}"`);

      // Try to read thread context, but fall back to minimal context if rate limited
      let threadContext = [];
      try {
        threadContext = await readFullThread(mention.conversation_id);
        console.log(`📖 Read thread with ${threadContext.length} tweets`);
      } catch (threadError) {
        console.log(`⚠️ Couldn't read full thread (${threadError.message}), using minimal context`);
        // Create minimal context from just the mention
        threadContext = [{
          id: mention.id,
          text: mention.text,
          author: { username: author?.username || 'unknown', name: author?.name || 'Unknown' },
          created_at: mention.created_at
        }];
      }

      // Generate a game prompt using AI - always succeeds now!
      const gamePrompt = await generateGamePrompt(threadContext);
      
      // The AI service now guarantees to return a prompt, so we don't need to check
      console.log('🎮 Generated game prompt successfully!');

      // Add Rosebud AI link to the prompt
      const enhancedPrompt = this.addRosebudLink(gamePrompt);
      console.log(`✨ Enhanced prompt: "${enhancedPrompt}"`);

      // Reply to the mention
      await this.replyToTweet(mention.id, enhancedPrompt);
      
      // Save that we replied to avoid duplicates
      await saveRepliedTweet(mention.id);
      
      console.log(`✅ Successfully replied to ${mention.id}`);

    } catch (error) {
      console.error(`❌ Error processing mention ${mention.id}:`, error);
    }
  }

  // Add Rosebud AI link to the game prompt
  addRosebudLink(gamePrompt) {
    // Simple, effective approach: guarantee users see at least 120 characters of the prompt
    // URL will contain the full prompt for Rosebud functionality
    
    const minVisibleChars = 120; // Minimum prompt text user should see
    const encodedPrompt = encodeURIComponent(gamePrompt);
    const fullUrl = `https://rosebud.ai/?prompt=${encodedPrompt}`;
    
    // Try to fit everything first
    const fullTweet = `${gamePrompt}\n\n${fullUrl}`;
    if (fullTweet.length <= 280) {
      return fullTweet;
    }
    
    // If too long, ensure visible prompt is at least minVisibleChars
    // Calculate space needed for URL and formatting
    const urlAndFormatting = `\n\n${fullUrl}`;
    const spaceForPrompt = 280 - urlAndFormatting.length;
    
    if (spaceForPrompt >= minVisibleChars) {
      // We have enough space to show a good portion of the prompt
      const visiblePrompt = gamePrompt.substring(0, spaceForPrompt - 3) + '...';
      return `${visiblePrompt}\n\n${fullUrl}`;
    }
    
    // URL is too long, need to truncate the prompt in the URL too
    // But still show at least minVisibleChars in the visible text
    const baseUrl = 'https://rosebud.ai/?prompt=';
    const reservedSpace = minVisibleChars + 4 + baseUrl.length; // prompt + \n\n + base URL
    const maxEncodedLength = 280 - reservedSpace;
    
    // Find a truncated prompt that fits in the remaining URL space
    let truncatedForUrl = gamePrompt;
    let encodedTruncated = encodeURIComponent(truncatedForUrl);
    
    // Keep reducing until it fits
    while (encodedTruncated.length > maxEncodedLength && truncatedForUrl.length > 50) {
      truncatedForUrl = truncatedForUrl.substring(0, truncatedForUrl.length - 10);
      encodedTruncated = encodeURIComponent(truncatedForUrl);
    }
    
    const truncatedUrl = `${baseUrl}${encodedTruncated}`;
    const visiblePrompt = gamePrompt.substring(0, minVisibleChars) + 
      (gamePrompt.length > minVisibleChars ? '...' : '');
    
    const result = `${visiblePrompt}\n\n${truncatedUrl}`;
    
    // Final safety check - if still too long, use basic link
    if (result.length > 280) {
      const basicLink = 'https://rosebud.ai/';
      const emergencyPrompt = gamePrompt.substring(0, 280 - basicLink.length - 4 - 3) + '...';
      return `${emergencyPrompt}\n\n${basicLink}`;
    }
    
    return result;
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