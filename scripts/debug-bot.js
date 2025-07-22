// Debug bot - processes known mentions without rate limit issues
require('dotenv').config();
const path = require('path');

// Add src directory to require path
const srcPath = path.join(__dirname, '..', 'src');
const { generateGamePrompt } = require(path.join(srcPath, 'ai-service'));
const { saveRepliedTweet, hasRepliedToTweet } = require(path.join(srcPath, 'persistence'));
const { readFullThread } = require(path.join(srcPath, 'thread-reader'));

// Simulate the real mention from your test
const realMention = {
  id: '1947678735421084044',
  text: '@MeghMehta160626 make a game',
  author_id: '1406553771111436291',
  created_at: '2025-07-22T15:22:51.000Z',
  conversation_id: '1946625525675430006'
};

const realIncludes = {
  users: [
    {
      id: '1406553771111436291',
      name: 'Megh',
      username: 'itsthemeg'
    }
  ]
};

// Add Rosebud AI link to the game prompt (same as in bot.js)
function addRosebudLink(gamePrompt) {
  const encodedPrompt = encodeURIComponent(gamePrompt);
  const rosebudUrl = `https://rosebud.ai?prompt=${encodedPrompt}`;
  const enhancedPrompt = `${gamePrompt}\n\n🎮 Build this game: ${rosebudUrl}`;
  
  if (enhancedPrompt.length > 280) {
    const shorterPrompt = `${gamePrompt}\n\n🎮 rosebud.ai`;
    return shorterPrompt.length <= 280 ? shorterPrompt : gamePrompt;
  }
  
  return enhancedPrompt;
}

async function debugProcessMention() {
  console.log('🔍 Debug Bot - Processing Real Mention');
  console.log('=====================================\n');
  
  try {
    // Check if we've already replied
    const alreadyReplied = await hasRepliedToTweet(realMention.id);
    console.log(`📝 Tweet ID: ${realMention.id}`);
    console.log(`📝 Already replied: ${alreadyReplied}`);
    
    if (alreadyReplied) {
      console.log('⏭️ Bot thinks it already replied to this tweet');
      console.log('💡 This might be why it\'s not replying again');
      return;
    }
    
    // Get author info
    const author = realIncludes.users.find(user => user.id === realMention.author_id);
    const authorName = author ? `@${author.username}` : 'someone';
    
    console.log(`📝 Processing mention from ${authorName}: "${realMention.text}"`);
    
    // Try to read thread context (this might fail due to rate limits)
    console.log('📖 Attempting to read thread context...');
    try {
      const threadContext = await readFullThread(realMention.conversation_id);
      console.log(`📖 Successfully read ${threadContext.length} tweets from thread`);
      
      if (threadContext.length === 0) {
        console.log('⚠️ No thread context found, using just the mention');
        // Create minimal context from just the mention
        const minimalContext = [{
          id: realMention.id,
          text: realMention.text,
          author: { username: author.username, name: author.name },
          created_at: realMention.created_at
        }];
        
        // Generate game prompt
        console.log('🧠 Generating game prompt with minimal context...');
        const gamePrompt = await generateGamePrompt(minimalContext);
        
        if (gamePrompt) {
          const enhancedPrompt = addRosebudLink(gamePrompt);
          console.log('✅ Generated prompt:');
          console.log(`"${gamePrompt}"`);
          console.log('\n🎮 Enhanced with Rosebud link:');
          console.log(`"${enhancedPrompt}"`);
          
          console.log('\n💡 This is what the bot SHOULD have posted as a reply');
          console.log('💡 If you want to test posting, we can add Twitter API call here');
        } else {
          console.log('❌ Failed to generate game prompt');
        }
      }
      
    } catch (threadError) {
      console.log('❌ Failed to read thread context:', threadError.message);
      console.log('💡 This is likely due to rate limits or API access issues');
    }
    
  } catch (error) {
    console.error('❌ Debug processing failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

// Run the debug
if (require.main === module) {
  debugProcessMention().catch(console.error);
}

module.exports = { debugProcessMention }; 