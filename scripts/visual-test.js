#!/usr/bin/env node

import { 
  promptUser, 
  selectTestMode, 
  selectEnvironment, 
  selectBrowserPlatform, 
  checkEnvironmentVariables, 
  runVisualTest, 
  closeInterface 
} from './utils/test-utils.js';

// Main execution function
async function main() {
  try {
    console.log('🎨 VACU Visual Regression Test Tool');
    console.log('===================================');
    
    // Check for required environment variables
    checkEnvironmentVariables();
    
    // Select test mode
    const testMode = await selectTestMode('Select test mode:');
    
    // Select environment
    const environment = await selectEnvironment('Select environment to test:');
    
    // For smoke tests, select browser platform
    let browserPlatform = null;
    if (testMode.name === 'Smoke Test') {
      browserPlatform = await selectBrowserPlatform('Select browser platform:');
    }
    
    // Confirm selection
    console.log(`\n📋 Visual Regression Test Summary:`);
    console.log(`   Mode: ${testMode.name}`);
    console.log(`   Environment: ${environment.name} (${environment.host})`);
    if (browserPlatform) {
      console.log(`   Browser: ${browserPlatform.name}`);
    }
    console.log(`   Percy Branch: ${environment.name}`);
    
    const confirm = await promptUser('\nProceed with visual regression test? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Visual regression test cancelled by user.');
      process.exit(0);
    }
    
    // Run the visual regression test
    await runVisualTest(environment, testMode, browserPlatform);
    
    console.log('\n🎉 Visual regression test completed successfully!');
    console.log(`📊 Check your Percy dashboard for the results in branch: ${environment.name}`);
    
  } catch (error) {
    console.error('\n❌ Error during visual regression test:', error.message);
    process.exit(1);
  } finally {
    closeInterface();
  }
}

// Run the script
main();
