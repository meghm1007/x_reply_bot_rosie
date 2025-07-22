// Test context understanding - simulate the exact Windows scenario
require('dotenv').config();
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src');
const { generateGamePrompt } = require(path.join(srcPath, 'ai-service'));

// Simulate the exact thread from your screenshot
const windowsThread = [
  {
    id: '1946625525675430006',
    text: 'windows just sucks',
    author: { username: 'itsthemeg', name: 'Megh' },
    created_at: '2024-07-19T12:00:00.000Z'
  },
  {
    id: '1947678735421084044',
    text: '@MeghMehta160626 make a game',
    author: { username: 'itsthemeg', name: 'Megh' },
    created_at: '2024-07-22T15:22:51.000Z'
  }
];

// Add Rosebud AI link
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

async function testContextUnderstanding() {
  console.log('🧪 Testing Context Understanding');
  console.log('===============================\n');
  
  console.log('📝 Simulating the exact thread:');
  console.log('1. "windows just sucks" (original post)');
  console.log('2. "@MeghMehta160626 make a game" (tag)\n');
  
  try {
    console.log('🧠 Generating contextual game prompt...');
    const gamePrompt = await generateGamePrompt(windowsThread);
    
    if (gamePrompt) {
      console.log('✅ Generated prompt:');
      console.log(`"${gamePrompt}"\n`);
      
      const enhancedPrompt = addRosebudLink(gamePrompt);
      console.log('🎮 With Rosebud link:');
      console.log(`"${enhancedPrompt}"\n`);
      
      // Check if it understood the context
      const isContextual = gamePrompt.toLowerCase().includes('windows') || 
                          gamePrompt.toLowerCase().includes('mac') ||
                          gamePrompt.toLowerCase().includes('laptop') ||
                          gamePrompt.toLowerCase().includes('computer');
      
      if (isContextual) {
        console.log('✅ SUCCESS: Bot understood the Windows context!');
      } else {
        console.log('❌ FAILED: Bot missed the Windows context');
        console.log('💡 The prompt should reference Windows, Mac, or computers');
      }
      
    } else {
      console.log('❌ Failed to generate prompt');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test other scenarios
const testScenarios = [
  {
    name: 'Pizza Debate',
    thread: [
      {
        id: 'test1',
        text: 'Pineapple on pizza is actually good!',
        author: { username: 'pizzalover', name: 'Pizza Fan' },
        created_at: '2024-01-01T12:00:00.000Z'
      },
      {
        id: 'test2', 
        text: '@MeghMehta160626 settle this debate',
        author: { username: 'pizzalover', name: 'Pizza Fan' },
        created_at: '2024-01-01T12:05:00.000Z'
      }
    ]
  },
  {
    name: 'Traffic Complaint',
    thread: [
      {
        id: 'test3',
        text: 'Traffic in this city is absolutely terrible. Took me 2 hours to go 5 miles!',
        author: { username: 'commuter', name: 'Daily Commuter' },
        created_at: '2024-01-01T08:00:00.000Z'
      },
      {
        id: 'test4',
        text: '@MeghMehta160626 make something fun out of this misery',
        author: { username: 'commuter', name: 'Daily Commuter' },
        created_at: '2024-01-01T08:05:00.000Z'
      }
    ]
  }
];

async function testAllScenarios() {
  await testContextUnderstanding();
  
  console.log('\n🧪 Testing Additional Scenarios');
  console.log('===============================\n');
  
  for (const scenario of testScenarios) {
    console.log(`📝 Testing: ${scenario.name}`);
    try {
      const prompt = await generateGamePrompt(scenario.thread);
      console.log(`✅ Generated: "${prompt}"\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
}

if (require.main === module) {
  testAllScenarios().catch(console.error);
}

module.exports = { testContextUnderstanding }; 