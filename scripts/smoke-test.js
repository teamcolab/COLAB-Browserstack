#!/usr/bin/env node

import { 
  promptUser, 
  selectEnvironment, 
  selectBrowserPlatform, 
  checkEnvironmentVariables, 
  runVisualTest, 
  closeInterface,
  testModes 
} from './utils/test-utils.js';

// Main execution function
async function main() {
  try {
    console.log('🔥 VACU Visual Regression Smoke Test Tool');
    console.log('==========================================');
    
    // Check for required environment variables
    checkEnvironmentVariables();
    
    // Select environment
    const environment = await selectEnvironment('Select environment to test:');
    
    // Select browser platform
    const browserPlatform = await selectBrowserPlatform('Select browser platform:');
    
    // Create smoke test mode
    const testMode = testModes[0]; // Smoke Test
    
    // Confirm selection
    console.log(`\n📋 Smoke Test Summary:`);
    console.log(`   Environment: ${environment.name} (${environment.host})`);
    console.log(`   Browser: ${browserPlatform.name}`);
    console.log(`   Percy Branch: ${environment.name}`);
    
    const confirm = await promptUser('\nProceed with smoke test? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Smoke test cancelled by user.');
      process.exit(0);
    }
    
    // Run the smoke test
    await runVisualTest(environment, testMode, browserPlatform);
    
    console.log('\n🎉 Smoke test completed successfully!');
    console.log(`📊 Check your Percy dashboard for the results in branch: ${environment.name}`);
    
  } catch (error) {
    console.error('\n❌ Error during smoke test:', error.message);
    process.exit(1);
  } finally {
    closeInterface();
  }
}

// Run the script
main();
