// Test URL format - shows the exact Rosebud AI links being generated
require('dotenv').config();

function addRosebudLink(gamePrompt) {
  const encodedPrompt = encodeURIComponent(gamePrompt);
  const rosebudUrl = `https://rosebud.ai/?prompt=${encodedPrompt}`;
  const enhancedPrompt = `${gamePrompt}\n\n🎮 Build this game: ${rosebudUrl}`;
  
  if (enhancedPrompt.length > 280) {
    const shorterPrompt = `${gamePrompt}\n\n🎮 https://rosebud.ai/?prompt=${encodedPrompt}`;
    if (shorterPrompt.length <= 280) {
      return shorterPrompt;
    }
    return `${gamePrompt}\n\n🎮 rosebud.ai`;
  }
  
  return enhancedPrompt;
}

console.log('🧪 Testing Rosebud AI URL Format');
console.log('=================================\n');

// Test different prompt lengths
const testPrompts = [
  "Build a space adventure game!",
  "Design a pizza-topping defense game! Protect your pineapple from angry purists wielding pepperoni projectiles!",
  "Create a very long game prompt that might exceed Twitter's character limit when combined with the URL to test our fallback behavior and see how we handle this edge case"
];

testPrompts.forEach((prompt, index) => {
  console.log(`📝 Test ${index + 1}: "${prompt}"`);
  console.log(`📏 Length: ${prompt.length} chars\n`);
  
  const enhanced = addRosebudLink(prompt);
  console.log(`✅ Enhanced prompt (${enhanced.length} chars):`);
  console.log(`"${enhanced}"\n`);
  
  // Extract just the URL part for clarity
  const urlMatch = enhanced.match(/https:\/\/rosebud\.ai\/\?prompt=[^\s]+/);
  if (urlMatch) {
    console.log(`🔗 Direct URL: ${urlMatch[0]}\n`);
  }
  
  console.log('---\n');
});

console.log('🎯 URL Format Examples:');
console.log('✅ Correct: https://rosebud.ai/?prompt=Create%20a%20fantasy%20adventure%20game');
console.log('❌ Wrong:   https://rosebud.ai?prompt=Create%20a%20fantasy%20adventure%20game');
console.log('\n💡 Note the "/" before "?" - this is the correct Rosebud AI format!'); 