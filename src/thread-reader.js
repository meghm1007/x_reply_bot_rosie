// Thread Reader - This reads entire Twitter conversation threads for context
const { TwitterApi } = require('twitter-api-v2');

// Initialize Twitter client for reading
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const client = twitterClient.readWrite;

/**
 * Read the full conversation thread for context
 * @param {string} conversationId - The conversation ID from Twitter
 * @returns {Promise<Array>} - Array of tweet objects in chronological order
 */
async function readFullThread(conversationId) {
  try {
    console.log(`📖 Reading thread: ${conversationId}`);
    
    if (!conversationId) {
      console.log('⚠️ No conversation ID provided');
      return [];
    }

    // First, try to get the original tweet that started the conversation
    let allTweets = [];
    
    try {
      const originalTweet = await client.v2.singleTweet(conversationId, {
        'tweet.fields': ['created_at', 'author_id', 'text', 'public_metrics'],
        'user.fields': ['username', 'name'],
        expansions: ['author_id']
      });
      
      if (originalTweet.data) {
        allTweets.push({
          ...originalTweet.data,
          isOriginal: true
        });
        console.log(`📍 Found original tweet: "${originalTweet.data.text.substring(0, 50)}..."`);
      }
    } catch (originalError) {
      console.log('⚠️ Could not fetch original tweet, proceeding with search');
    }

    // Get all tweets in the conversation
    const tweets = await client.v2.search(`conversation_id:${conversationId}`, {
      max_results: parseInt(process.env.MAX_THREAD_LENGTH) || 20,
      'tweet.fields': ['created_at', 'author_id', 'text', 'public_metrics', 'referenced_tweets'],
      'user.fields': ['username', 'name'],
      expansions: ['author_id', 'referenced_tweets.id'],
      sort_order: 'chronological'
    });

    // Combine original tweet with search results
    if (tweets.data && tweets.data.length > 0) {
      allTweets = allTweets.concat(tweets.data);
    }

    if (allTweets.length === 0) {
      console.log('📭 No tweets found in conversation');
      return [];
    }

    // Remove duplicates and process tweets
    const uniqueTweets = allTweets.filter((tweet, index, self) => 
      index === self.findIndex(t => t.id === tweet.id)
    );
    
    const processedTweets = processTweets(uniqueTweets, tweets.includes);
    
    console.log(`✅ Successfully read ${processedTweets.length} tweets from thread`);
    return processedTweets;

  } catch (error) {
    console.error('❌ Error reading thread:', error);
    
    // If we can't read the full thread, try to get just the original tweet
    return await getFallbackContext(conversationId);
  }
}

/**
 * Process raw tweet data into a clean format
 * @param {Array} tweetsData - Raw tweet data from API
 * @param {Object} includes - Additional data (users, etc.)
 * @returns {Array} - Processed tweet objects
 */
function processTweets(tweetsData, includes = {}) {
  const users = includes.users || [];
  
  // Create a map of user IDs to usernames for easy lookup
  const userMap = {};
  users.forEach(user => {
    userMap[user.id] = {
      username: user.username,
      name: user.name
    };
  });

  // Process each tweet
  return tweetsData.map(tweet => {
    const author = userMap[tweet.author_id] || { username: 'unknown', name: 'Unknown' };
    
    return {
      id: tweet.id,
      text: tweet.text,
      author: {
        id: tweet.author_id,
        username: author.username,
        name: author.name
      },
      created_at: tweet.created_at,
      metrics: tweet.public_metrics || {}
    };
  });
}

/**
 * Fallback method to get some context when full thread reading fails
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Array>} - Limited context array
 */
async function getFallbackContext(conversationId) {
  try {
    console.log('🔄 Attempting fallback context retrieval...');
    
    // Try to get the original tweet that started the conversation
    const originalTweet = await client.v2.singleTweet(conversationId, {
      'tweet.fields': ['created_at', 'author_id', 'text'],
      'user.fields': ['username', 'name'],
      expansions: ['author_id']
    });

    if (originalTweet.data) {
      const processedTweets = processTweets([originalTweet.data], originalTweet.includes);
      console.log('✅ Got fallback context from original tweet');
      return processedTweets;
    }

    return [];

  } catch (error) {
    console.error('❌ Fallback context also failed:', error);
    return [];
  }
}

/**
 * Get context around a specific tweet (replies and parent)
 * @param {string} tweetId - The specific tweet ID
 * @returns {Promise<Array>} - Context tweets
 */
async function getTweetContext(tweetId) {
  try {
    console.log(`🔍 Getting context for tweet: ${tweetId}`);

    // Get the tweet details first
    const tweet = await client.v2.singleTweet(tweetId, {
      'tweet.fields': ['conversation_id', 'created_at', 'author_id', 'text', 'referenced_tweets'],
      'user.fields': ['username', 'name'],
      expansions: ['author_id', 'referenced_tweets.id']
    });

    if (!tweet.data) {
      return [];
    }

    // If this tweet is part of a conversation, read the full thread
    if (tweet.data.conversation_id) {
      return await readFullThread(tweet.data.conversation_id);
    }

    // Otherwise, just return this tweet
    return processTweets([tweet.data], tweet.includes);

  } catch (error) {
    console.error('❌ Error getting tweet context:', error);
    return [];
  }
}

/**
 * Filter out potentially problematic content from thread context
 * @param {Array} tweets - Array of tweet objects
 * @returns {Array} - Filtered tweets
 */
function filterThreadContent(tweets) {
  return tweets.filter(tweet => {
    // Skip tweets that are too short or just mentions
    if (tweet.text.length < 10) return false;
    
    // Skip tweets that are mostly mentions
    const mentionCount = (tweet.text.match(/@\w+/g) || []).length;
    const wordCount = tweet.text.split(/\s+/).length;
    if (mentionCount > wordCount * 0.5) return false;
    
    // Skip retweets (they start with RT @)
    if (tweet.text.startsWith('RT @')) return false;
    
    return true;
  });
}

/**
 * Summarize thread content for debugging
 * @param {Array} tweets - Array of tweet objects
 * @returns {string} - Summary string
 */
function summarizeThread(tweets) {
  if (!tweets || tweets.length === 0) return 'Empty thread';
  
  const authors = [...new Set(tweets.map(t => t.author.username))];
  const totalChars = tweets.reduce((sum, t) => sum + t.text.length, 0);
  
  return `${tweets.length} tweets by ${authors.length} users (${totalChars} chars total)`;
}

module.exports = {
  readFullThread,
  getTweetContext,
  processTweets,
  filterThreadContent,
  summarizeThread
}; 