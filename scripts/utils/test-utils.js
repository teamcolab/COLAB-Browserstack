import { createInterface } from 'readline';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import environments from '../../config/environments.js';
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

// Test modes
export const testModes = [
  { name: 'Smoke Test', description: 'Single browser platform - faster testing', config: 'browserstack.smoke.yml', isSmoke: true },
  { name: 'Full Test', description: 'All browser platforms - comprehensive testing', config: 'browserstack.yml', isSmoke: false }
];

// Available browser platforms for smoke tests
export const browserPlatforms = [
  { name: 'Chrome (macOS)', config: 'browserstack.smoke.chrome.yml', description: 'Chrome on macOS Tahoe' },
  { name: 'Firefox (macOS)', config: 'browserstack.smoke.firefox.yml', description: 'Firefox on macOS Tahoe' },
  { name: 'WebKit/Safari (macOS)', config: 'browserstack.smoke.webkit.yml', description: 'WebKit/Safari on macOS Tahoe' },
  { name: 'Safari (iOS)', config: 'browserstack.smoke.ios-safari.yml', description: 'Safari on iPhone 15 Pro' },
  { name: 'Firefox (iOS)', config: 'browserstack.smoke.ios-firefox.yml', description: 'Firefox on iPhone 15 Pro' },
  { name: 'Chrome (iOS)', config: 'browserstack.smoke.ios-chrome.yml', description: 'Chrome on iPhone 15 Pro' }
];

// Utility function to prompt user for input
export function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Utility function to validate URL format
export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Display test mode selection menu
export function displayTestModeMenu(modes, promptText) {
  console.log(`\n${promptText}`);
  console.log('Available test modes:');
  
  modes.forEach((mode, index) => {
    console.log(`  ${index + 1}. ${mode.name}`);
    console.log(`     ${mode.description}`);
  });
  console.log('');
}

// Display environment selection menu
export function displayEnvironmentMenu(environments, promptText) {
  console.log(`\n${promptText}`);
  console.log('Available environments:');
  
  environments.forEach((env, index) => {
    console.log(`  ${index + 1}. ${env.name} (${env.host})`);
  });
  
  console.log(`  ${environments.length + 1}. Custom URL`);
  console.log('');
}

// Display browser platform selection menu
export function displayBrowserMenu(platforms, promptText) {
  console.log(`\n${promptText}`);
  console.log('Available browser platforms:');
  
  platforms.forEach((platform, index) => {
    console.log(`  ${index + 1}. ${platform.name}`);
    console.log(`     ${platform.description}`);
  });
  console.log('');
}

// Get user's test mode selection
export async function selectTestMode(promptText) {
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

// Get user's environment selection
export async function selectEnvironment(promptText) {
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

// Get user's browser platform selection
export async function selectBrowserPlatform(promptText) {
  while (true) {
    displayBrowserMenu(browserPlatforms, promptText);
    
    const choice = await promptUser('Enter your choice (number): ');
    const choiceNum = parseInt(choice);
    
    if (choiceNum >= 1 && choiceNum <= browserPlatforms.length) {
      return browserPlatforms[choiceNum - 1];
    } else {
      console.log('❌ Invalid choice. Please enter a number from the list.');
    }
  }
}

// Check for required environment variables
export function checkEnvironmentVariables() {
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
}

// Run visual regression test
export async function runVisualTest(environment, testMode, browserPlatform = null, projectRoot = null) {
  const rootDir = projectRoot || join(__dirname, '../..');
  
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running visual regression test:`);
    console.log(`   Mode: ${testMode.name}`);
    console.log(`   Environment: ${environment.name} (${environment.host})`);
    if (browserPlatform) {
      console.log(`   Browser: ${browserPlatform.name}`);
    }
    console.log(`   Config: ${browserPlatform ? browserPlatform.config : testMode.config}`);
    
    // Set environment variables for the test
    const env = {
      ...process.env,
      TEST_ENVIRONMENT: environment.name === 'custom' ? 'custom' : environment.name,
      TEST_HOST: environment.host,
      PERCY_BRANCH: environment.name,
      BROWSERSTACK_BUILD_NAME: browserPlatform 
        ? `VACU Visual Regression ${testMode.name} - ${browserPlatform.name} - ${environment.name}`
        : `VACU Visual Regression ${testMode.name} - ${environment.name}`,
      BROWSERSTACK_CONFIG_FILE: browserPlatform ? browserPlatform.config : testMode.config
    };
    
    // Spawn the visual regression test
    const testProcess = spawn('npx', [
      'percy', 'exec', '--',
      'npx', 'browserstack-node-sdk', 'playwright', 'test',
      'tests/test-visualregression.js',
      '--config=./playwright.config.js'
    ], {
      env,
      stdio: 'inherit',
      cwd: rootDir
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Visual regression test completed successfully!`);
        console.log(`   Mode: ${testMode.name}`);
        console.log(`   Environment: ${environment.name}`);
        if (browserPlatform) {
          console.log(`   Browser: ${browserPlatform.name}`);
        }
        console.log(`   Percy Branch: ${environment.name}`);
        resolve();
      } else {
        console.log(`\n❌ Visual regression test failed (exit code: ${code})`);
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      console.log(`\n❌ Error running visual regression test:`, error.message);
      reject(error);
    });
  });
}

// Close readline interface
export function closeInterface() {
  rl.close();
}
