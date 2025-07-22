// Manual testing script - Test your bot logic without API calls
require('dotenv').config();
const path = require('path');

// Add src directory to require path
const srcPath = path.join(__dirname, '..', 'src');
const { generateGamePrompt } = require(path.join(srcPath, 'ai-service'));
const { saveRepliedTweet, hasRepliedToTweet } = require(path.join(srcPath, 'persistence'));

// Add Rosebud AI link to the game prompt (same as in bot.js)
function addRosebudLink(gamePrompt) {
  // Create a URL with the prompt pre-filled (correct format with /)
  const encodedPrompt = encodeURIComponent(gamePrompt);
  const rosebudUrl = `https://rosebud.ai/?prompt=${encodedPrompt}`;
  
  // Add the link to the prompt in a natural way
  const enhancedPrompt = `${gamePrompt}\n\n🎮 Build this game: ${rosebudUrl}`;
  
  // Make sure we don't exceed Twitter's character limit (280 chars)
  if (enhancedPrompt.length > 280) {
    // If too long, use a shorter format with correct URL
    const shorterPrompt = `${gamePrompt}\n\n🎮 https://rosebud.ai/?prompt=${encodedPrompt}`;
    if (shorterPrompt.length <= 280) {
      return shorterPrompt;
    }
    // If still too long, use minimal format
    return `${gamePrompt}\n\n🎮 rosebud.ai`;
  }
  
  return enhancedPrompt;
}

// Simulate real tweet mentions for testing (fresh IDs for new prompt style)
const realTestMentions = [
  {
    id: 'test_007',
    text: '@MeghMehta160626 Love space exploration games! The mystery of the cosmos is fascinating.',
    author: { username: 'spacefan', name: 'Space Explorer' },
    created_at: '2024-01-15T19:00:00.000Z',
    conversation_id: 'conv_007'
  },
  {
    id: 'test_008', 
    text: '@MeghMehta160626 Been reading about ancient civilizations lately. Egypt and Rome are so cool!',
    author: { username: 'historybuff', name: 'History Enthusiast' },
    created_at: '2024-01-15T20:00:00.000Z',
    conversation_id: 'conv_008'
  },
  {
    id: 'test_009',
    text: '@MeghMehta160626 Working on my cooking skills. Making pasta from scratch is harder than expected!',
    author: { username: 'chefwannabe', name: 'Home Cook' },
    created_at: '2024-01-15T21:00:00.000Z',
    conversation_id: 'conv_009'
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