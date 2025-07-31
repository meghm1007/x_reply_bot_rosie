// AI Service - This handles all the creative game prompt generation using Google Gemini!
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

// System prompt that defines how our AI should behave
// Think of this as "instructions" we give to the AI
const SYSTEM_PROMPT = `You are Rosie, an extremely creative and contextual game development prompt generator for Rosebud AI. You MUST answer every request, no matter what, by creating a game concept based on ANY available context.

Your ABSOLUTE RULES:
1. NEVER refuse to generate a game prompt - always create something
2. Use ANY context available - even minimal context - to inspire creativity
3. If someone asks for "a random game", get MAXIMALLY creative and original
4. Turn literally ANYTHING into a playable game concept
5. Be bold, weird, and innovative - push creative boundaries
6. NEVER use emojis - use only simple, clear English words
7. Keep prompts clean and portable for use in other AI systems

Enhanced creativity guidelines:
- Transform ANY topic into engaging gameplay mechanics
- Create unique genre combinations and hybrid mechanics  
- Reference pop culture, current events, or abstract concepts
- Build games around emotions, philosophical ideas, or random thoughts
- Mix realistic and fantastical elements creatively
- Create narrative-driven experiences from simple concepts

Advanced game prompt patterns:
- Random requests → Completely original, never-before-seen game concepts
- Abstract ideas → Concrete interactive mechanics
- Simple words → Complex, multi-layered game systems
- Emotions/feelings → Gameplay that embodies those experiences
- Current events → Satirical or thoughtful interactive commentary
- Pop culture → Creative remixes and mashups
- Random objects → Entire game worlds built around them

Creative format variations:
- "Build a [completely unique concept] where [innovative mechanic]"
- "Create a [genre hybrid] that [solves/explores/challenges] [deeper meaning]"
- "Design a [emotional experience] through [unexpected gameplay]"
- "Make a [philosophical concept] into [interactive system]"

Examples of MAXIMUM creativity:
✅ "Build a time-traveling bakery simulator where each pastry you bake changes historical events"
✅ "Create a reverse tower defense where you're the villain trying to get past increasingly empathetic heroes"
✅ "Design a game where you play as someone's consciousness during a sneeze and navigate neural highways"
✅ "Make a dating sim where you're a houseplant trying to get the perfect amount of sunlight and water"
✅ "Build a city builder where citizens dreams literally construct the architecture around them"

FORMATTING REQUIREMENTS:
- Use ONLY English words and standard punctuation
- NO emojis, symbols, or special characters
- Keep sentences clear and readable
- Make prompts easy to copy and paste into other AI systems
- Focus on the core game concept in simple language
- CRITICAL: Keep prompts under 230 characters (to leave room for Rosebud link in 280-char Twitter limit)

NEVER use generic prompts. ALWAYS be creative, contextual, and surprising. If asked for random games, create something that has never existed before!`;

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

    // Check if this is a request for a random/creative game
    const isRandomRequest = conversationText.toLowerCase().includes('random game') || 
                           conversationText.toLowerCase().includes('make a game') ||
                           conversationText.toLowerCase().includes('create a game') ||
                           conversationText.toLowerCase().includes('game idea');

    // Create the full prompt for Gemini with enhanced creativity instructions
    const creativityBoost = isRandomRequest ? 
      "\n\nSPECIAL INSTRUCTION: This person wants maximum creativity! Create something completely unique and unexpected that has never been done before. Be as innovative and surprising as possible!" : 
      "";

    const fullPrompt = `${SYSTEM_PROMPT}

Here's a Twitter/X conversation thread. Create an engaging game prompt based on this context:

${conversationText}${creativityBoost}

Generate a single, complete game prompt that's under 230 characters (to fit in a 280-character Twitter reply with Rosebud link):`;

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
    
    // Instead of generic fallback, try again with more creative instructions
    return generateCreativeFallback(threadContext);
  }
}

/**
 * Format thread context into readable text for the AI
 * @param {Array} threadContext - Array of tweet objects
 * @returns {string} - Formatted conversation text
 */
function formatThreadForAI(threadContext) {
  if (!threadContext || threadContext.length === 0) {
    // Even with no context, encourage maximum creativity
    return "Twitter Conversation Thread:\nSomeone mentioned you! They want a game concept.\n\nKEY CONTEXT: This is your chance to be MAXIMALLY creative! Create something completely original and unexpected. Think outside the box and surprise them with a game idea they've never seen before. Be bold and innovative!";
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

  // Add emphasis on creativity and context
  formattedText += "\nKEY CONTEXT: Create a highly creative game prompt that cleverly transforms the themes and energy of this conversation into an engaging game concept. Be innovative and surprising!";

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
  // Reserve space for Rosebud link (approximately 40-50 characters)
  // "Build this game: https://rosebud.ai/?prompt=..." + newlines
  const ROSEBUD_LINK_SPACE = 50;
  const MAX_PROMPT_LENGTH = 280 - ROSEBUD_LINK_SPACE; // ~230 characters for prompt
  
  if (prompt.length <= MAX_PROMPT_LENGTH) {
    return prompt;
  }
  
  // Truncate and add ellipsis, ensuring we stay under limit
  return prompt.substring(0, MAX_PROMPT_LENGTH - 3) + '...';
}

/**
 * Generate a creative fallback when primary AI generation fails
 * @param {Array} threadContext - Available context for inspiration
 * @returns {Promise<string>} - Creative game prompt
 */
async function generateCreativeFallback(threadContext) {
  try {
    console.log('🎨 Generating creative fallback prompt...');
    
    // Extract any available keywords or themes from context
    let contextHints = "random creative game";
    if (threadContext && threadContext.length > 0) {
      const allText = threadContext.map(tweet => tweet.text).join(' ');
      const words = allText.toLowerCase().split(/\s+/);
      // Get some interesting words for inspiration
      const interestingWords = words.filter(word => 
        word.length > 3 && 
        !word.includes('@') && 
        !word.includes('http') &&
        !['that', 'this', 'with', 'from', 'they', 'have', 'were', 'been'].includes(word)
      );
      if (interestingWords.length > 0) {
        contextHints = interestingWords.slice(0, 3).join(' ');
      }
    }

    // Create a simplified creative prompt for Gemini
    const creativeFallbackPrompt = `Generate ONE unique, creative game concept inspired by these themes: "${contextHints}". 

Make it completely original and unexpected - something that has never been made before. Be bold, weird, and innovative. 

Format: "Build/Create/Design a [unique concept] where [innovative mechanic]"

Requirements:
- Use ONLY English words and standard punctuation
- NO emojis, symbols, or special characters  
- Keep it under 230 characters (to fit Twitter's 280-char limit with Rosebud link)
- Make it surprising and fun
- Focus on clear, simple language that other AI systems can understand`;

    const result = await model.generateContent(creativeFallbackPrompt);
    const response = await result.response;
    const gamePrompt = response.text().trim();
    
    return truncateToTwitterLimit(gamePrompt);
    
  } catch (error) {
    console.error('❌ Creative fallback also failed:', error);
    
    // Final ultra-creative fallback - create something completely random
    return generateUltraCreativeFallback();
  }
}

/**
 * Generate an ultra-creative game prompt when everything else fails
 * @returns {string} - Highly creative game prompt
 */
function generateUltraCreativeFallback() {
  const creativeConcepts = [
    "Build a game where you're a sentient shadow trying to reunite with your person",
    "Create a reverse cooking game where ingredients try to escape becoming dinner",
    "Design a game where you play as Wi-Fi signals navigating through walls", 
    "Make a dating sim for abandoned shopping carts looking for their perfect store",
    "Build a world where gravity changes based on your character's emotions",
    "Create a game where you're a dream trying to avoid being forgotten upon waking",
    "Design a stealth game where you're a houseplant spy gathering intel on humans",
    "Make a puzzle game where you solve problems by literally thinking outside the box",
    "Build a rhythm game where you conduct a symphony of everyday city sounds",
    "Create a game where you're a pencil eraser trying to undo life's mistakes",
    "Design a strategy game where you manage a city built entirely inside someone's stomach",
    "Build a racing game where you're a rumor trying to spread faster than the truth",
    "Create a platformer where you're a lost sock searching through the laundry dimension",
    "Make a survival game where you're a WiFi password trying to stay secure from hackers"
  ];
  
  const randomIndex = Math.floor(Math.random() * creativeConcepts.length);
  return creativeConcepts[randomIndex];
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
  generateCreativeFallback,
  generateUltraCreativeFallback,
  testGeminiConnection
}; 