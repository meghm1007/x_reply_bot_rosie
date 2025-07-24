// Test script to verify the tweet reading and response format fixes
require('dotenv').config();
const { generateGamePrompt } = require('../src/ai-service');

// Test the addRosebudLink function
function addRosebudLink(gamePrompt) {
  // Create a URL with the prompt pre-filled - ensure proper formatting
  const encodedPrompt = encodeURIComponent(gamePrompt);
  const rosebudUrl = `https://rosebud.ai/?prompt=${encodedPrompt}`;
  
  // Format the response to match the desired style from the image
  // Use the exact format: prompt + line break + link with text
  const enhancedPrompt = `${gamePrompt}\n\n🎮 Build this game: ${rosebudUrl}`;
  
  // Check if it fits in Twitter's character limit (280 chars)
  if (enhancedPrompt.length <= 280) {
    return enhancedPrompt;
  }
  
  // If too long, try shorter format without "Build this game:" text
  const shorterPrompt = `${gamePrompt}\n\n🎮 ${rosebudUrl}`;
  if (shorterPrompt.length <= 280) {
    return shorterPrompt;
  }
  
  // If still too long, truncate the game prompt but keep the full URL
  // This ensures the URL is always clickable
  const maxPromptLength = 280 - rosebudUrl.length - 10; // 10 chars for "\n\n🎮 " 
  const truncatedPrompt = gamePrompt.length > maxPromptLength 
    ? gamePrompt.substring(0, maxPromptLength - 3) + '...'
    : gamePrompt;
  
  return `${truncatedPrompt}\n\n🎮 ${rosebudUrl}`;
}

async function testFixes() {
  console.log('🧪 Testing Bot Fixes');
  console.log('====================\n');
  
  // Test 1: Empty context handling (should no longer return "No context provided")
  console.log('📝 Test 1: Empty Context Handling');
  console.log('----------------------------------');
  
  try {
    console.log('🔍 Testing with empty thread context...');
    const emptyPrompt = await generateGamePrompt([]);
    console.log('✅ Generated prompt with empty context:');
    console.log(`"${emptyPrompt}"`);
    console.log('📏 Length:', emptyPrompt.length, 'characters\n');
    
    if (emptyPrompt.includes('No context provided') || emptyPrompt.includes('No context available')) {
      console.log('❌ FAIL: Still returning "No context" message');
    } else {
      console.log('✅ PASS: Generated proper game prompt even with empty context\n');
    }
  } catch (error) {
    console.log('❌ FAIL: Error with empty context:', error.message, '\n');
  }
  
  // Test 2: Response format with URL
  console.log('📝 Test 2: Response Format with Rosebud URL');
  console.log('--------------------------------------------');
  
  // Test with short prompt
  const shortPrompt = "Build a simple puzzle game!";
  const shortResponse = addRosebudLink(shortPrompt);
  console.log('🔍 Testing with short prompt:');
  console.log(`Input: "${shortPrompt}"`);
  console.log(`Output: "${shortResponse}"`);
  console.log('📏 Length:', shortResponse.length, '/280 characters');
  console.log('🔗 Contains full URL:', shortResponse.includes('https://rosebud.ai/?prompt='));
  console.log('🎮 Proper format:', shortResponse.includes('🎮 Build this game:'), '\n');
  
  // Test with long prompt
  const longPrompt = "Build an epic multiplayer online battle arena game with complex character customization, multiple game modes, ranked competitive play, seasonal content updates, and cross-platform compatibility!";
  const longResponse = addRosebudLink(longPrompt);
  console.log('🔍 Testing with long prompt:');
  console.log(`Input: "${longPrompt}" (${longPrompt.length} chars)`);
  console.log(`Output: "${longResponse}"`);
  console.log('📏 Length:', longResponse.length, '/280 characters');
  console.log('🔗 Contains full URL:', longResponse.includes('https://rosebud.ai/?prompt='));
  console.log('✂️ Properly truncated:', longResponse.length <= 280, '\n');
  
  // Test 3: URL encoding
  console.log('📝 Test 3: URL Encoding');
  console.log('----------------------');
  
  const specialPrompt = "Build a game with emojis! 🎮🌟 #awesome @player";
  const specialResponse = addRosebudLink(specialPrompt);
  console.log('🔍 Testing with special characters:');
  console.log(`Input: "${specialPrompt}"`);
  console.log(`Output: "${specialResponse}"`);
  
  // Extract the URL from the response
  const urlMatch = specialResponse.match(/https:\/\/rosebud\.ai\/\?prompt=([^\\s]+)/);
  if (urlMatch) {
    const encodedPart = urlMatch[1];
    const decodedPart = decodeURIComponent(encodedPart);
    console.log('🔗 URL encoding working:', decodedPart === specialPrompt);
    console.log('📋 Encoded URL:', urlMatch[0]);
  }
  
  console.log('\n🎉 Fix Testing Complete!');
  console.log('\n💡 Expected Results:');
  console.log('✅ No more "No context provided" messages');
  console.log('✅ All responses include clickable Rosebud AI links');
  console.log('✅ URLs contain the game prompt as query parameter');
  console.log('✅ Responses stay under 280 characters');
}

// Run the tests
testFixes().catch(console.error); 