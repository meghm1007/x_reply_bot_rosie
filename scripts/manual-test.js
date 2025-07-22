// Manual testing script - Test your bot logic without API calls
require('dotenv').config();
const path = require('path');

// Add src directory to require path
const srcPath = path.join(__dirname, '..', 'src');
const { generateGamePrompt } = require(path.join(srcPath, 'ai-service'));
const { saveRepliedTweet, hasRepliedToTweet } = require(path.join(srcPath, 'persistence'));

// Add Rosebud AI link to the game prompt (same as in bot.js)
function addRosebudLink(gamePrompt) {
  // Create a URL with the prompt pre-filled
  const encodedPrompt = encodeURIComponent(gamePrompt);
  const rosebudUrl = `https://rosebud.ai?prompt=${encodedPrompt}`;
  
  // Add the link to the prompt in a natural way
  const enhancedPrompt = `${gamePrompt}\n\n🎮 Build this game: ${rosebudUrl}`;
  
  // Make sure we don't exceed Twitter's character limit (280 chars)
  if (enhancedPrompt.length > 280) {
    // If too long, use a shorter format
    const shorterPrompt = `${gamePrompt}\n\n🎮 rosebud.ai`;
    return shorterPrompt.length <= 280 ? shorterPrompt : gamePrompt;
  }
  
  return enhancedPrompt;
}

// Simulate real tweet mentions for testing (with fresh IDs)
const realTestMentions = [
  {
    id: 'test_004',
    text: '@MeghMehta160626 I love playing retro arcade games! What should I try next?',
    author: { username: 'retrogamer', name: 'Retro Gaming Fan' },
    created_at: '2024-01-15T16:00:00.000Z',
    conversation_id: 'conv_004'
  },
  {
    id: 'test_005', 
    text: '@MeghMehta160626 Just got into board games! Any suggestions for beginners?',
    author: { username: 'boardgamer', name: 'Board Game Newbie' },
    created_at: '2024-01-15T17:00:00.000Z',
    conversation_id: 'conv_005'
  },
  {
    id: 'test_006',
    text: '@MeghMehta160626 Building my first mobile app and need creative ideas!',
    author: { username: 'appdeveloper', name: 'Mobile Dev' },
    created_at: '2024-01-15T18:00:00.000Z',
    conversation_id: 'conv_006'
  }
];

async function testBotLogic() {
  console.log('🎮 Testing Bot Logic with Real-Style Mentions');
  console.log('=============================================\n');
  
  for (const mention of realTestMentions) {
    console.log(`📝 Testing mention from @${mention.author.username}:`);
    console.log(`   "${mention.text}"\n`);
    
    try {
      // Check if we've already "replied" (for duplicate testing)
      const alreadyReplied = await hasRepliedToTweet(mention.id);
      if (alreadyReplied) {
        console.log('   ⏭️ Already replied to this mention\n');
        continue;
      }
      
      // Create simple thread context (just the mention)
      const threadContext = [mention];
      
      // Generate game prompt
      console.log('   🧠 Generating game prompt...');
      const gamePrompt = await generateGamePrompt(threadContext);
      
      if (gamePrompt) {
        // Test the Rosebud link addition
        const enhancedPrompt = addRosebudLink(gamePrompt);
        console.log('   ✅ Generated prompt:');
        console.log(`   "${gamePrompt}"\n`);
        console.log('   🎮 Enhanced with Rosebud link:');
        console.log(`   "${enhancedPrompt}"\n`);
        
        // Save that we "replied" (for testing)
        await saveRepliedTweet(mention.id);
        console.log('   💾 Marked as replied\n');
      } else {
        console.log('   ❌ Failed to generate prompt\n');
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing mention: ${error.message}\n`);
    }
    
    console.log('---\n');
  }
  
  console.log('🎉 Manual testing completed!');
  console.log('💡 If prompts look good, your bot logic is working correctly!');
}

// Run the test
if (require.main === module) {
  testBotLogic().catch(console.error);
}

module.exports = { testBotLogic, realTestMentions }; 