// Simple environment variable checker
require('dotenv').config();

console.log('🔧 Environment Variables Check:');
console.log('===============================');

const requiredVars = [
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET', 
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'GEMINI_API_KEY',
  'BOT_USERNAME'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 10)}...` : 'NOT SET';
  console.log(`${status} ${varName}: ${display}`);
});

console.log('\n📁 Current directory:', process.cwd());
console.log('📄 .env file exists:', require('fs').existsSync('.env'));

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log(`\n⚠️  Missing variables: ${missingVars.join(', ')}`);
  console.log('💡 Copy env.example to .env and fill in your API keys');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are set!');
  console.log('🚀 Ready to run your bot!');
} 