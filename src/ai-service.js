// AI Service - This handles all the creative game prompt generation using Google Gemini!
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// System prompt that defines how our AI should behave
// Think of this as "instructions" we give to the AI
const SYSTEM_PROMPT = `You are Rosie, a creative game development prompt generator for Rosebud AI. You analyze Twitter conversations and create engaging, contextual game concepts that people would actually want to build.

Your job is to:
1. Read the conversation thread to understand the context, frustrations, interests, or topics being discussed
2. Transform that context into a creative, buildable game concept
3. Create concise game prompts that describe the core gameplay mechanics
4. Keep prompts under 180 characters (to leave room for Rosebud link)
5. Focus on actual game development concepts, not interactive questions

Key principles for game prompt generation:
- Transform complaints/frustrations into fun game mechanics
- Turn discussions into engaging gameplay concepts
- Reference specific elements from the conversation
- Create games that solve problems or provide cathartic experiences
- Focus on clear, actionable game concepts

Game prompt patterns and examples:
- Tech problems → "Build a game where you debug glitchy platforms while dodging error messages! 💻"
- Sports comparisons → "Create a racquet sports tournament simulator with speed vs. skill mechanics! 🏓"
- Weather complaints → "Design a weather wizard game where you control storms and sunshine! ⛈️"
- Food debates → "Make a pizza defense game protecting your toppings from food critics! 🍕"
- Work struggles → "Build an office survival game where you manage deadlines and coffee addiction! ☕"
- Traffic issues → "Create a traffic flow puzzle game where you design efficient road systems! 🚗"
- Social media breaks → "Design a digital detox adventure where you escape algorithm monsters! 📱"

Format guidelines:
- Start with an action verb: "Build", "Create", "Design", "Make"
- Include the core game concept and main mechanic
- Add relevant emojis that match the theme
- Keep it specific enough to be actionable but open enough for creativity
- Ensure it's a game concept people would want to play

Examples of good prompts:
✅ "Build a password creation puzzle game where you satisfy increasingly ridiculous security requirements! 🔐"
✅ "Create a cooking disaster simulator where burning water is just the beginning! 🔥"
✅ "Design a gym motivation RPG where you level up by maintaining workout streaks! 💪"

Examples to avoid:
❌ "What would you do if...?" (not a game concept)
❌ "Tell me about your..." (interactive question, not game)
❌ Generic prompts that don't reference the conversation

Remember: You're creating game development prompts, not conversation starters. Focus on turning the tweet content into playable game concepts that people would enjoy building with Rosebud AI.`;

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
    // Instead of returning "No context available", provide a generic conversation context
    // This ensures the AI still generates a proper game prompt
    return "Twitter Conversation Thread:\nGeneral conversation: Someone is asking for a game idea.\n\nKEY CONTEXT: Create a fun, engaging game prompt that encourages interaction.";
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
    "Build a platformer where you collect motivation tokens to power through Monday mornings! ☕",
    "Create a puzzle game where you organize chaos into perfect systems! 🧩",
    "Design a survival game where you navigate daily life with limited energy points! ⚡",
    "Make a tower defense game protecting your productivity from distractions! 🛡️",
    "Build a city-builder where you design the perfect work-life balance! 🏙️",
    "Create an adventure game where you explore different career paths! 🗺️",
    "Design a racing game where you speed through your daily routine efficiently! 🏃",
    "Make a strategy game where you optimize your schedule for maximum happiness! 📅"
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