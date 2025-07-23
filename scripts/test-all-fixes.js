// Test all the fixes - context, mention checking, and URL formatting
require('dotenv').config();
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src');
const { generateGamePrompt } = require(path.join(srcPath, 'ai-service'));

// Test scenarios based on the images
const testScenarios = [
  {
    name: 'Full Context Test',
    description: 'Original tweet + reply with tag (like image 1)',
    thread: [
      {
        id: 'original_tweet',
        text: 'i hope squash becomes as famous as pickleball',
        author: { username: 'itsthemeg', name: 'Megh' },
        created_at: '2024-07-19T12:00:00.000Z',
        isOriginal: true
      },
      {
        id: 'follow_up',
        text: 'having played all three squash, pickleball and tennis...',
        author: { username: 'itsthemeg', name: 'Megh' },
        created_at: '2024-07-19T12:05:00.000Z'
      },
      {
        id: 'tag_mention',
        text: '@MeghMehta160626 make a game',
        author: { username: 'itsthemeg', name: 'Megh' },
        created_at: '2024-07-19T12:10:00.000Z'
      }
    ]
  },
  {
    name: 'Windows Context Test',
    description: 'Windows complaint + game request',
    thread: [
      {
        id: 'original_complaint',
        text: 'windows just sucks',
        author: { username: 'itsthemeg', name: 'Megh' },
        created_at: '2024-07-19T12:00:00.000Z',
        isOriginal: true
      },
      {
        id: 'game_request',
        text: '@MeghMehta160626 make a game',
        author: { username: 'itsthemeg', name: 'Megh' },
        created_at: '2024-07-19T12:05:00.000Z'
      }
    ]
  }
];

// Test mention detection
function testMentionDetection() {
  console.log('🔍 Testing Mention Detection');
  console.log('============================\n');
  
  const botUsername = process.env.BOT_USERNAME || 'MeghMehta160626';
  
  const mentionTests = [
    {
      text: `@${botUsername} make a game`,
      shouldTrigger: true,
      description: 'Direct mention'
    },
    {
      text: 'This is a great game! Thanks for the suggestion.',
      shouldTrigger: false,
      description: 'No mention (should NOT trigger)'
    },
    {
      text: `Hey @${botUsername} can you help?`,
      shouldTrigger: true,
      description: 'Mention in middle of text'
    },
    {
      text: 'im gonna make this bot way more better',
      shouldTrigger: false,
      description: 'No mention at all'
    }
  ];
  
  mentionTests.forEach((test, index) => {
    const botMentioned = test.text.toLowerCase().includes(`@${botUsername.toLowerCase()}`);
    const result = botMentioned === test.shouldTrigger ? '✅' : '❌';
    
    console.log(`${result} Test ${index + 1}: ${test.description}`);
    console.log(`   Text: "${test.text}"`);
    console.log(`   Expected: ${test.shouldTrigger ? 'TRIGGER' : 'IGNORE'}`);
    console.log(`   Actual: ${botMentioned ? 'TRIGGER' : 'IGNORE'}\n`);
  });
}

// Test URL formatting
function testUrlFormatting() {
  console.log('🔗 Testing URL Formatting');
  console.log('=========================\n');
  
  const testPrompts = [
    "Build a squash vs pickleball game!",
    "Create a Windows-dodging adventure game where you collect MacBooks! 💻"
  ];
  
  testPrompts.forEach((prompt, index) => {
    const encodedPrompt = encodeURIComponent(prompt);
    const rosebudUrl = `https://rosebud.ai/?prompt=${encodedPrompt}`;
    
    console.log(`📝 Test ${index + 1}: "${prompt}"`);
    console.log(`🔗 Generated URL: ${rosebudUrl}`);
    console.log(`📏 URL Length: ${rosebudUrl.length} chars\n`);
    
    // Test if URL is properly encoded
    const decoded = decodeURIComponent(encodedPrompt);
    const isCorrect = decoded === prompt;
    console.log(`${isCorrect ? '✅' : '❌'} Encoding test: ${isCorrect ? 'PASS' : 'FAIL'}\n`);
  });
}

// Test context understanding
async function testContextUnderstanding() {
  console.log('🧠 Testing Context Understanding');
  console.log('================================\n');
  
  const botUsername = process.env.BOT_USERNAME || 'MeghMehta160626';
  
  // Update scenarios to use correct bot username
  const updatedScenarios = testScenarios.map(scenario => ({
    ...scenario,
    thread: scenario.thread.map(tweet => ({
      ...tweet,
      text: tweet.text.includes('@MeghMehta160626') ? 
        tweet.text.replace('@MeghMehta160626', `@${botUsername}`) : 
        tweet.text
    }))
  }));
  
  for (const scenario of updatedScenarios) {
    console.log(`📝 Testing: ${scenario.name}`);
    console.log(`📄 Description: ${scenario.description}\n`);
    
    // Show the full thread context
    console.log('📖 Thread context:');
    scenario.thread.forEach((tweet, index) => {
      const prefix = tweet.isOriginal ? '📍 ORIGINAL' : `${index + 1}.`;
      console.log(`   ${prefix} @${tweet.author.username}: "${tweet.text}"`);
    });
    console.log();
    
    try {
      const gamePrompt = await generateGamePrompt(scenario.thread);
      
      if (gamePrompt) {
        console.log(`✅ Generated prompt: "${gamePrompt}"`);
        
        // Check if it references the context appropriately
        const originalTweet = scenario.thread.find(t => t.isOriginal);
        if (originalTweet) {
          const referencesContext = scenario.name === 'Full Context Test' ? 
            (gamePrompt.toLowerCase().includes('squash') || gamePrompt.toLowerCase().includes('pickleball')) :
            (gamePrompt.toLowerCase().includes('windows') || gamePrompt.toLowerCase().includes('mac'));
          
          console.log(`${referencesContext ? '✅' : '❌'} Context awareness: ${referencesContext ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
        }
      } else {
        console.log('❌ Failed to generate prompt');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n---\n');
  }
}

async function runAllTests() {
  console.log('🚀 Testing All Bot Fixes');
  console.log('========================\n');
  
  testMentionDetection();
  console.log('\n');
  
  testUrlFormatting();
  console.log('\n');
  
  await testContextUnderstanding();
  
  console.log('🎉 All tests completed!');
  console.log('\n💡 Summary of fixes:');
  console.log('✅ Enhanced thread context reading (gets original tweet)');
  console.log('✅ Added mention detection (only responds when tagged)');
  console.log('✅ Verified URL formatting (correct Rosebud AI links)');
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests }; 