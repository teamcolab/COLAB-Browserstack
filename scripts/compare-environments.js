#!/usr/bin/env node

import { createInterface } from 'readline';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import environments from '../config/environments.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to prompt user for input
function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Utility function to validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Display environment selection menu
function displayEnvironmentMenu(environments, promptText) {
  console.log(`\n${promptText}`);
  console.log('Available environments:');
  
  environments.forEach((env, index) => {
    console.log(`  ${index + 1}. ${env.name} (${env.host})`);
  });
  
  console.log(`  ${environments.length + 1}. Custom URL`);
  console.log('');
}

// Get user's environment selection
async function selectEnvironment(promptText) {
  const envOptions = [...environments];
  
  while (true) {
    displayEnvironmentMenu(envOptions, promptText);
    
    const choice = await promptUser('Enter your choice (number): ');
    const choiceNum = parseInt(choice);
    
    if (choiceNum >= 1 && choiceNum <= envOptions.length) {
      return envOptions[choiceNum - 1];
    } else if (choiceNum === envOptions.length + 1) {
      // Custom URL option
      const customUrl = await promptUser('Enter custom URL (e.g., https://example.com): ');
      
      if (!isValidUrl(customUrl)) {
        console.log('❌ Invalid URL format. Please enter a valid URL starting with http:// or https://');
        continue;
      }
      
      return {
        name: 'custom',
        host: customUrl
      };
    } else {
      console.log('❌ Invalid choice. Please enter a number from the list.');
    }
  }
}

// Run visual regression test for a specific environment
async function runVisualRegressionTest(environment, branchName, isSmokeTest, baselineEnvironment) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running visual regression test for ${environment.name} (${environment.host})`);
    console.log(`   Branch: ${branchName}`);
    
    // Set environment variables for the test
    const env = {
      ...process.env,
      TEST_ENVIRONMENT: environment.name === 'custom' ? 'custom' : environment.name,
      TEST_HOST: environment.host,
      PERCY_BRANCH: branchName,
      BROWSERSTACK_BUILD_NAME: isSmokeTest 
        ? `VACU Visual Regression Comparison Smoke Test (Chrome Only) - ${environment.name}`
        : `VACU Visual Regression Comparison - ${environment.name}`,
      BROWSERSTACK_CONFIG_FILE: isSmokeTest ? 'browserstack.smoke.yml' : 'browserstack.yml'
    };
    
    // Spawn the visual regression test
    const testProcess = spawn('npx', [
      'percy', 'exec', '--',
      'npx', 'browserstack-node-sdk', 'playwright', 'test',
      'tests/test-visualregression.js',
      '--config=./playwright.config.js'
    ], {
      env,
      stdio: ['inherit', 'pipe', 'pipe'], // Capture stdout/stderr to parse Percy build IDs
      cwd: join(__dirname, '..')
    });
    
    let percyBuildId = null;
    let output = '';
    
    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text); // Still show output to user
      
      // Extract Percy build ID from output
      const buildMatch = text.match(/Finalized build #\d+: https:\/\/percy\.io\/[^\/]+\/[^\/]+\/builds\/([a-f0-9]+)/);
      if (buildMatch) {
        percyBuildId = buildMatch[1];
      }
    });
    
    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.error(text); // Still show errors to user
    });
    
    testProcess.on('close', async (code) => {
      if (code === 0) {
        console.log(`✅ Visual regression test completed successfully for ${environment.name}`);
        
        // If this is the baseline (first environment), accept the snapshots automatically
        if (percyBuildId && environment.name === baselineEnvironment.name) {
          console.log(`🎯 Automatically accepting baseline snapshots for comparison...`);
          await acceptPercyBaseline(percyBuildId);
        }
        
        resolve();
      } else {
        console.log(`❌ Visual regression test failed for ${environment.name} (exit code: ${code})`);
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      console.log(`❌ Error running visual regression test for ${environment.name}:`, error.message);
      reject(error);
    });
  });
}

// Function to accept Percy baseline snapshots
async function acceptPercyBaseline(buildId) {
  const percyApiToken = process.env.PERCY_API_TOKEN;
  
  if (!percyApiToken) {
    console.log('⚠️  PERCY_API_TOKEN not found - skipping baseline acceptance');
    return;
  }

  try {
    console.log(`🔍 Accepting baseline snapshots for build: ${buildId}`);
    
    const response = await fetch(`https://api.percy.io/v1/builds/${buildId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${percyApiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Baseline snapshots accepted successfully');
    } else {
      console.log(`❌ Failed to accept baseline: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error accepting baseline: ${error.message}`);
  }
}

// Main execution function
async function main() {
  try {
    // Check for smoke test flag
    const isSmokeTest = process.argv.includes('--smoke');
    
    console.log('🔍 Visual Regression Environment Comparison Tool');
    if (isSmokeTest) {
      console.log('🚀 SMOKE TEST MODE - Chrome only');
    }
    console.log('================================================');
    
    // Check for required environment variables
    if (!process.env.PERCY_TOKEN) {
      console.log('❌ PERCY_TOKEN not found in environment variables.');
      console.log('   Please ensure your .env file contains PERCY_TOKEN.');
      process.exit(1);
    }
    
    if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
      console.log('❌ BrowserStack credentials not found in environment variables.');
      console.log('   Please ensure your .env file contains BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY.');
      process.exit(1);
    }
    
    console.log('✅ Environment variables loaded successfully');
    
    // Select first environment (baseline)
    const env1 = await selectEnvironment('Select first environment (baseline):');
    
    // Select second environment (comparison)
    const env2 = await selectEnvironment('Select second environment (comparison):');
    
    // Generate unique branch name for Percy
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const branchName = `env-comparison-${env1.name}-vs-${env2.name}-${timestamp}`;
    
    console.log(`\n📋 Comparison Summary:`);
    console.log(`   Baseline: ${env1.name} (${env1.host})`);
    console.log(`   Comparison: ${env2.name} (${env2.host})`);
    console.log(`   Percy Branch: ${branchName}`);
    
    const confirm = await promptUser('\nProceed with visual regression comparison? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Comparison cancelled by user.');
      process.exit(0);
    }
    
    // Run tests for both environments
    console.log('\n🔄 Starting visual regression comparison...');
    
    // Run baseline test
    await runVisualRegressionTest(env1, branchName, isSmokeTest, env1);
    
    // Run comparison test
    await runVisualRegressionTest(env2, branchName, isSmokeTest, env1);
    
    console.log('\n🎉 Visual regression comparison completed successfully!');
    console.log(`📊 Check your Percy dashboard for the comparison results in branch: ${branchName}`);
    
  } catch (error) {
    console.error('\n❌ Error during visual regression comparison:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();
