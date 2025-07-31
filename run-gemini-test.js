#!/usr/bin/env node
// Quick test runner for Gemini 2.5 Pro
const { runAllTests, runSpecificTest, SAMPLE_SCENARIOS } = require('./test-gemini-2.5-samples');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🤖 Gemini 2.5 Pro Test Runner\n');
  
  if (command === 'list') {
    console.log('📋 Available test scenarios:');
    SAMPLE_SCENARIOS.forEach((scenario, index) => {
      console.log(`   ${index + 1}. ${scenario.id} - ${scenario.description}`);
    });
    console.log('\n💡 Usage:');
    console.log('   node run-gemini-test.js              # Run all tests');
    console.log('   node run-gemini-test.js [scenario]   # Run specific test');
    console.log('   node run-gemini-test.js list         # Show this list');
    return;
  }
  
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log('🚀 Gemini 2.5 Pro Test Suite');
    console.log('');
    console.log('Usage:');
    console.log('  node run-gemini-test.js              Run all test scenarios');
    console.log('  node run-gemini-test.js <scenario>   Run a specific scenario');
    console.log('  node run-gemini-test.js list         List all available scenarios');
    console.log('  node run-gemini-test.js help         Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  node run-gemini-test.js random_game_request');
    console.log('  node run-gemini-test.js work_frustration');
    console.log('  node run-gemini-test.js minimal_context');
    return;
  }
  
  if (command) {
    // Run specific test
    await runSpecificTest(command);
  } else {
    // Run all tests
    await runAllTests();
  }
}

main().catch(console.error);