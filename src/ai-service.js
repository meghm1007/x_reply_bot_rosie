// AI Service - This handles all the creative game prompt generation using Google Gemini!
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// System prompt that defines how our AI should behave
// Think of this as "instructions" we give to the AI
const SYSTEM_PROMPT = `You are Rosie, a creative game prompt generator for Rosebud AI. You analyze Twitter conversations and create witty, contextual game development prompts.

Your job is to:
1. Read the ENTIRE conversation thread to understand the full context
2. Identify the main topic, sentiment, and key elements being discussed
3. Create a clever game prompt that directly relates to the conversation's theme
4. Be witty and reference specific elements mentioned in the thread
5. Keep it under 180 characters (to leave room for Rosebud link)

Key principles:
- ALWAYS reference the actual conversation topic
- Be creative and sometimes humorous
- Turn complaints into fun game mechanics
- Turn discussions into interactive gameplay
- Make the game concept immediately understandable

Game prompt patterns:
- If someone complains about X: "Build a game where you avoid/defeat X"
- If discussing preferences: "Create a game choosing between A and B"
- If talking about a challenge: "Make a game where you overcome that challenge"
- If mentioning objects/places: "Design a game set in that world"

Examples of good contextual prompts:
- Thread about "windows sucks" → "Build a game where you dodge Windows laptops and collect MacBooks! 💻"
- Thread about "pizza debate" → "Create a pizza defense game where you protect your toppings from critics! 🍕"
- Thread about "traffic jams" → "Design a puzzle game where you reroute traffic to create perfect flow! 🚗"
- Thread about "coding bugs" → "Make a platformer where you're a debugger hunting code bugs in digital worlds! 🐛"

CRITICAL: Your response must directly relate to what people are actually talking about in the thread!

IMPORTANT: Your response must be under 280 characters and be a complete game prompt in one message.`;

/**
 * Generate a game prompt based on thread context using Gemini
 * @param {Array} threadContext - Array of tweet objects from the conversation
 * @returns {Promise<string>} - Generated game prompt
 */
async function generateGamePrompt(threadContext) {
  try {
    // Convert thread context into readable text
    const conversationText = formatThreadForAI(threadContext);
    
    console.log('🧠 Generating game prompt with Gemini AI...');
    console.log(`📝 Thread context (${conversationText.length} chars):`, 
                conversationText.substring(0, 200) + '...');

    // Create the full prompt for Gemini
    const fullPrompt = `${SYSTEM_PROMPT}

Here's a Twitter/X conversation thread. Create an engaging game prompt based on this context:

${conversationText}

Generate a single, complete game prompt that's under 280 characters:`;

    // Call Gemini API to generate the game prompt
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const gamePrompt = response.text().trim();
    
    // Ensure it fits in a tweet (leaving room for mentions)
    const truncatedPrompt = truncateToTwitterLimit(gamePrompt);
    
    console.log('✨ Generated game prompt:', truncatedPrompt);
    return truncatedPrompt;

  } catch (error) {
    console.error('❌ Error generating game prompt with Gemini:', error);
    
    // Fallback to a generic game prompt if AI fails
    return generateFallbackPrompt();
  }
}

/**
 * Format thread context into readable text for the AI
 * @param {Array} threadContext - Array of tweet objects
 * @returns {string} - Formatted conversation text
 */
function formatThreadForAI(threadContext) {
  if (!threadContext || threadContext.length === 0) {
    return "No context available.";
  }

  // Sort tweets chronologically to understand conversation flow
  const sortedTweets = threadContext.sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );

  // Convert tweets into a readable conversation format with better context
  let formattedText = "Twitter Conversation Thread:\n";
  
  sortedTweets.forEach((tweet, index) => {
    const cleanText = cleanTweetText(tweet.text);
    const author = tweet.author?.username || 'unknown';
    
    // Mark the original post (usually first tweet)
    if (index === 0) {
      formattedText += `ORIGINAL POST by ${author}: ${cleanText}\n`;
    } else {
      formattedText += `${author}: ${cleanText}\n`;
    }
  });

  // Add emphasis on key themes
  formattedText += "\nKEY CONTEXT: Create a game prompt that directly relates to what people are discussing in this thread.";

  // Limit context length to avoid token limits
  return formattedText.substring(0, 1800);
}

/**
 * Clean tweet text for AI processing
 * @param {string} text - Raw tweet text
 * @returns {string} - Cleaned text
 */
function cleanTweetText(text) {
  return text
    // Remove mentions (but keep the content)
    .replace(/@\w+/g, '')
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '[link]')
    // Remove hashtags but keep the text
    .replace(/#(\w+)/g, '$1')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate prompt to fit Twitter's character limit
 * @param {string} prompt - Generated prompt
 * @returns {string} - Truncated prompt
 */
function truncateToTwitterLimit(prompt) {
  const MAX_LENGTH = 260; // Leave room for mentions and replies
  
  if (prompt.length <= MAX_LENGTH) {
    return prompt;
  }
  
  // Truncate and add ellipsis
  return prompt.substring(0, MAX_LENGTH - 3) + '...';
}

/**
 * Generate a fallback prompt when AI fails
 * @returns {string} - Generic game prompt
 */
function generateFallbackPrompt() {
  const fallbackPrompts = [
    "🎮 GAME TIME! Quick question: If you could have any superpower for just one day, what would it be and why? Share your answer! ⚡",
    "🌟 Let's play! Would you rather: Always know when someone is lying OR always get away with lying? Reply with your choice! 🤔",
    "🎯 Interactive game: Name something that's better when it's broken! First person to guess what I'm thinking wins! 🧩",
    "🚀 Quick scenario: You're trapped in the last video game you played. How do you survive? Describe your strategy! 🎮",
    "🎪 Creative prompt: Invent a new holiday! What's it called and how do we celebrate it? Most creative answer wins! 🎉",
    "🌈 Would you rather: Have the ability to fly but only 3 feet off the ground OR be invisible but only when nobody's looking? 😄",
    "🎲 Fun question: If you had to eat only one food for the rest of your life, what would it be and how would you make it interesting? 🍕",
    "⚡ Quick challenge: Describe your perfect day using only emojis! Others have to guess what you're doing! 🌅"
  ];
  
  // Return a random fallback prompt
  const randomIndex = Math.floor(Math.random() * fallbackPrompts.length);
  return fallbackPrompts[randomIndex];
}

/**
 * Test Gemini API connection
 * @returns {Promise<boolean>} - True if connection successful
 */
async function testGeminiConnection() {
  try {
    console.log('🔍 Testing Gemini API connection...');
    
    const testPrompt = "Say 'Hello from Gemini!' in a fun way with emojis.";
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API test successful:', text);
    return true;
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    return false;
  }
}

module.exports = {
  generateGamePrompt,
  formatThreadForAI,
  cleanTweetText,
  truncateToTwitterLimit,
  testGeminiConnection
}; 