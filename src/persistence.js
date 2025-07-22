// Persistence - This keeps track of which tweets we've already replied to
// This prevents our bot from spamming the same thread multiple times!
const fs = require('fs-extra');
const path = require('path');

// File to store our replied tweets data
const REPLIED_TWEETS_FILE = path.join(__dirname, '..', 'data', 'replied-tweets.json');

/**
 * Initialize the persistence system
 * Creates the data directory and file if they don't exist
 */
async function initializePersistence() {
  try {
    // Make sure the data directory exists
    await fs.ensureDir(path.dirname(REPLIED_TWEETS_FILE));
    
    // Create the file if it doesn't exist
    if (!(await fs.pathExists(REPLIED_TWEETS_FILE))) {
      await fs.writeJson(REPLIED_TWEETS_FILE, {
        repliedTweets: [],
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0'
        }
      });
      console.log('📁 Created replied tweets database');
    }
    
    console.log('✅ Persistence system initialized');
  } catch (error) {
    console.error('❌ Error initializing persistence:', error);
  }
}

/**
 * Check if we've already replied to a specific tweet
 * @param {string} tweetId - The tweet ID to check
 * @returns {Promise<boolean>} - True if we've already replied
 */
async function hasRepliedToTweet(tweetId) {
  try {
    await initializePersistence();
    
    const data = await fs.readJson(REPLIED_TWEETS_FILE);
    const repliedTweets = data.repliedTweets || [];
    
    // Check if this tweet ID is in our list
    const hasReplied = repliedTweets.some(entry => entry.tweetId === tweetId);
    
    if (hasReplied) {
      console.log(`🔍 Already replied to tweet ${tweetId}`);
    }
    
    return hasReplied;
    
  } catch (error) {
    console.error('❌ Error checking replied tweets:', error);
    // If we can't read the file, assume we haven't replied (safer to reply than not)
    return false;
  }
}

/**
 * Save a tweet ID to our replied tweets list
 * @param {string} tweetId - The tweet ID we replied to
 * @param {string} replyId - Our reply tweet ID (optional)
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<void>}
 */
async function saveRepliedTweet(tweetId, replyId = null, metadata = {}) {
  try {
    await initializePersistence();
    
    const data = await fs.readJson(REPLIED_TWEETS_FILE);
    
    // Create a new entry
    const newEntry = {
      tweetId: tweetId,
      replyId: replyId,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    
    // Add to the list
    data.repliedTweets = data.repliedTweets || [];
    data.repliedTweets.push(newEntry);
    
    // Keep only the last 1000 entries to prevent file from growing too large
    if (data.repliedTweets.length > 1000) {
      data.repliedTweets = data.repliedTweets.slice(-1000);
      console.log('🧹 Cleaned up old replied tweets entries');
    }
    
    // Update metadata
    data.metadata.lastUpdated = new Date().toISOString();
    data.metadata.totalReplies = data.repliedTweets.length;
    
    // Save back to file
    await fs.writeJson(REPLIED_TWEETS_FILE, data, { spaces: 2 });
    
    console.log(`💾 Saved replied tweet: ${tweetId} -> ${replyId || 'unknown'}`);
    
  } catch (error) {
    console.error('❌ Error saving replied tweet:', error);
  }
}

/**
 * Get statistics about our bot's activity
 * @returns {Promise<Object>} - Statistics object
 */
async function getStats() {
  try {
    await initializePersistence();
    
    const data = await fs.readJson(REPLIED_TWEETS_FILE);
    const repliedTweets = data.repliedTweets || [];
    
    // Calculate some basic stats
    const totalReplies = repliedTweets.length;
    const today = new Date().toISOString().split('T')[0];
    const todayReplies = repliedTweets.filter(entry => 
      entry.timestamp.startsWith(today)
    ).length;
    
    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReplies = repliedTweets.filter(entry => 
      new Date(entry.timestamp) > oneDayAgo
    ).length;
    
    return {
      totalReplies,
      todayReplies,
      recentReplies,
      firstReply: repliedTweets[0]?.timestamp || null,
      lastReply: repliedTweets[repliedTweets.length - 1]?.timestamp || null
    };
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return {
      totalReplies: 0,
      todayReplies: 0,
      recentReplies: 0,
      firstReply: null,
      lastReply: null
    };
  }
}

/**
 * Clean up old entries (older than specified days)
 * @param {number} maxDays - Maximum days to keep entries
 * @returns {Promise<number>} - Number of entries removed
 */
async function cleanupOldEntries(maxDays = 30) {
  try {
    await initializePersistence();
    
    const data = await fs.readJson(REPLIED_TWEETS_FILE);
    const originalCount = data.repliedTweets?.length || 0;
    
    if (originalCount === 0) return 0;
    
    // Calculate cutoff date
    const cutoffDate = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000);
    
    // Filter out old entries
    data.repliedTweets = data.repliedTweets.filter(entry => 
      new Date(entry.timestamp) > cutoffDate
    );
    
    const removedCount = originalCount - data.repliedTweets.length;
    
    if (removedCount > 0) {
      // Update metadata
      data.metadata.lastCleaned = new Date().toISOString();
      data.metadata.totalReplies = data.repliedTweets.length;
      
      // Save back to file
      await fs.writeJson(REPLIED_TWEETS_FILE, data, { spaces: 2 });
      
      console.log(`🧹 Cleaned up ${removedCount} old entries (older than ${maxDays} days)`);
    }
    
    return removedCount;
    
  } catch (error) {
    console.error('❌ Error cleaning up old entries:', error);
    return 0;
  }
}

/**
 * Export replied tweets data for backup
 * @returns {Promise<Object>} - Complete data object
 */
async function exportData() {
  try {
    await initializePersistence();
    return await fs.readJson(REPLIED_TWEETS_FILE);
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    return null;
  }
}

/**
 * Get recent replied tweets for debugging
 * @param {number} limit - Number of recent entries to return
 * @returns {Promise<Array>} - Array of recent entries
 */
async function getRecentReplies(limit = 10) {
  try {
    await initializePersistence();
    
    const data = await fs.readJson(REPLIED_TWEETS_FILE);
    const repliedTweets = data.repliedTweets || [];
    
    // Return the most recent entries
    return repliedTweets.slice(-limit).reverse();
    
  } catch (error) {
    console.error('❌ Error getting recent replies:', error);
    return [];
  }
}

module.exports = {
  initializePersistence,
  hasRepliedToTweet,
  saveRepliedTweet,
  getStats,
  cleanupOldEntries,
  exportData,
  getRecentReplies
}; 