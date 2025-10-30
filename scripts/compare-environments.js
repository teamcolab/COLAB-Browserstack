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
    
    // Function to extract build ID from text (check multiple patterns)
    function extractBuildId(text) {
      // Pattern 1: "[percy] Finalized build #X: https://percy.io/.../builds/ID" (numeric ID)
      // Example: [percy] Finalized build #40: https://percy.io/b237edcc/web/VACU-a95ca7a3/builds/44268697
      // Note: Percy URLs have 3 path segments before /builds/ (org/project/repo)
      const pattern1 = /\[percy\]\s+Finalized build #\d+:\s+https:\/\/percy\.io\/[^\/\s]+\/[^\/\s]+\/[^\/\s]+\/builds\/(\d+)/;
      // Pattern 2: "Finalized build #X: https://percy.io/.../builds/ID" (without [percy] prefix)
      const pattern2 = /Finalized build #\d+:\s+https:\/\/percy\.io\/[^\/\s]+\/[^\/\s]+\/[^\/\s]+\/builds\/(\d+)/;
      // Pattern 3: Just extract numeric build ID from /builds/XXXX in any percy.io URL (flexible path)
      const pattern3 = /https:\/\/percy\.io\/[^\/\s]+(?:\/[^\/\s]+)*\/builds\/(\d+)/;
      // Pattern 4: Build finalized message variations (case insensitive, numeric ID, flexible path)
      const pattern4 = /build.*finalized.*https:\/\/percy\.io\/[^\/\s]+(?:\/[^\/\s]+)*\/builds\/(\d+)/i;
      
      let match = text.match(pattern1) || text.match(pattern2) || text.match(pattern3) || text.match(pattern4);
      return match ? match[1] : null;
    }
    
    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text); // Still show output to user
      
      // Extract Percy build ID from accumulated output (in case ID spans chunks)
      if (!percyBuildId) {
        const buildId = extractBuildId(output);
        if (buildId) {
          percyBuildId = buildId;
          console.log(`\n📌 Detected Percy build ID: ${buildId}`);
        }
      }
    });
    
    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.error(text); // Still show errors to user
      
      // Also check accumulated output for build ID (Percy sometimes outputs to stderr)
      if (!percyBuildId) {
        const buildId = extractBuildId(output);
        if (buildId) {
          percyBuildId = buildId;
          console.log(`\n📌 Detected Percy build ID from stderr: ${buildId}`);
        }
      }
    });
    
    testProcess.on('close', async (code) => {
      // Final check for build ID in accumulated output (in case it appeared at the very end)
      if (!percyBuildId) {
        const buildId = extractBuildId(output);
        if (buildId) {
          percyBuildId = buildId;
          console.log(`\n📌 Detected Percy build ID from final output: ${buildId}`);
        }
      }
      
      if (code === 0) {
        console.log(`✅ Visual regression test completed successfully for ${environment.name}`);
        
        // If this is the baseline (first environment), accept the snapshots automatically
        if (environment.name === baselineEnvironment.name) {
          if (percyBuildId) {
            console.log(`🎯 Automatically accepting baseline snapshots for comparison...`);
            await acceptPercyBaseline(percyBuildId);
          } else {
            console.log(`⚠️  Warning: Could not extract Percy build ID from output`);
            console.log(`   Baseline snapshots were NOT automatically accepted.`);
            console.log(`   You may need to manually accept them using:`);
            console.log(`   node scripts/accept-baseline.js <build-id>`);
            console.log(`   Check the output above for the Percy build URL.`);
            // Try to find any percy.io URL in the output as a last resort
            const urlMatch = output.match(/https:\/\/percy\.io\/[^\s-/]+/);
            if (urlMatch) {
              console.log(`   Found Percy URL in output: ${urlMatch[0]}`);
            }
          }
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
    console.log('   Please add PERCY_API_TOKEN to your .env file');
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
      const responseData = await response.json().catch(() => ({}));
      console.log('✅ Baseline snapshots accepted successfully');
      if (responseData.build && responseData.build['web-url']) {
        console.log(`   Build URL: ${responseData.build['web-url']}`);
      }
    } else {
      const errorText = await response.text().catch(() => '');
      console.log(`❌ Failed to accept baseline: ${response.status} ${response.statusText}`);
      if (errorText) {
        console.log(`   Error: ${errorText}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error accepting baseline: ${error.message}`);
  }
}

// Test modes
const testModes = [
  { name: 'Smoke Test', description: 'Single browser platform - faster testing', isSmoke: true },
  { name: 'Full Test', description: 'All browser platforms - comprehensive testing', isSmoke: false }
];

// Display test mode selection menu
function displayTestModeMenu(modes, promptText) {
  console.log(`\n${promptText}`);
  console.log('Available test modes:');
  
  modes.forEach((mode, index) => {
    console.log(`  ${index + 1}. ${mode.name}`);
    console.log(`     ${mode.description}`);
  });
  console.log('');
}

// Get user's test mode selection
async function selectTestMode(promptText) {
  while (true) {
    displayTestModeMenu(testModes, promptText);
    
    const choice = await promptUser('Enter your choice (number): ');
    const choiceNum = parseInt(choice);
    
    if (choiceNum >= 1 && choiceNum <= testModes.length) {
      return testModes[choiceNum - 1];
    } else {
      console.log('❌ Invalid choice. Please enter a number from the list.');
    }
  }
}

// Main execution function
async function main() {
  try {
    // Check for smoke test flag (for backward compatibility)
    const isSmokeTestFromArgs = process.argv.includes('--smoke');
    
    console.log('🔍 Visual Regression Environment Comparison Tool');
    console.log('================================================');
    
    // Select test mode (unless --smoke flag is provided for backward compatibility)
    let testMode;
    if (isSmokeTestFromArgs) {
      testMode = testModes[0]; // Smoke test
      console.log('🚀 SMOKE TEST MODE - Chrome only (from --smoke flag)');
    } else {
      testMode = await selectTestMode('Select test mode:');
    }
    
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
    
    // Select first environment (baseline)
    const env1 = await selectEnvironment('Select first environment (baseline):');
    
    // Select second environment (comparison)
    const env2 = await selectEnvironment('Select second environment (comparison):');
    
    // Generate unique branch name for Percy
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const branchName = `env-comparison-${env1.name}-vs-${env2.name}-${timestamp}`;
    
    console.log(`\n📋 Comparison Summary:`);
    console.log(`   Mode: ${testMode.name}`);
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
    await runVisualRegressionTest(env1, branchName, testMode.isSmoke, env1);
    
    // Run comparison test
    await runVisualRegressionTest(env2, branchName, testMode.isSmoke, env1);
    
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
