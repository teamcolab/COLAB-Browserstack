// tests/test-visualregression.js
// Visits a list of pages and takes a single Percy snapshot on each.
// Requires PERCY_TOKEN in the environment.

import { test } from '@playwright/test';
import { percyScreenshot } from '@percy/playwright'; // prefer official helper
import pages from '../config/pages.js';
import environments from '../config/environments.js';
import { getBreakpointsForProject } from '../config/project-breakpoints.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure Percy token is available
if (!process.env.PERCY_TOKEN) {
  console.warn('⚠️  PERCY_TOKEN not found in environment variables. Percy tests may fail.');
}

// Ensure BrowserStack credentials are available
if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
  console.warn('⚠️  BrowserStack credentials not found in environment variables. Tests may fail.');
}

console.log('✅ Environment variables loaded successfully');
console.log(`   BrowserStack: ${process.env.BROWSERSTACK_USERNAME ? '✅' : '❌'}`);
console.log(`   Percy: ${process.env.PERCY_TOKEN ? '✅' : '❌'}`);

//  Run tests sequentially to avoid BrowserStack parallel limits
test.describe.configure({ mode: 'parallel' });

// Get the test environment (default to 'test' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'test';

// Handle custom environment with TEST_HOST override
let environment;
if (testEnvironment === 'custom' && process.env.TEST_HOST) {
  environment = {
    name: 'custom',
    host: process.env.TEST_HOST
  };
} else {
  environment = environments.find(env => env.name === testEnvironment) || environments[0];
}

pages.forEach(({ name, path }) => {
  const url = `${environment.host}${path}`;
  test(`${name}`, async ({ page }, testInfo) => {
    // Navigate & let things settle a touch
    // BrowserStack mobile Safari only supports 'load', others can use 'domcontentloaded'
    const projectName = testInfo.project.name;
    const waitUntil = (projectName.includes('iPhone') || projectName.includes('ios')) ? 'load' : 'domcontentloaded';
    await page.goto(url, { waitUntil });

    async function scrollPage(page) {
      // scroll down the page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(200);
      // scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(100);
    }

    // Get device-specific viewports based on the test project
    console.log(`🔍 Testing project: "${projectName}"`);
    const viewportsToTest = getBreakpointsForProject(projectName);

    // Iterate over device-specific viewports and take screenshots
    for (const viewport of viewportsToTest) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height }); 
      scrollPage(page);
      
      // Use the same screenshot name for all devices/browsers to group them in Percy UI
      const screenshotName = `${name}`;
      
      console.log(`📸 Taking screenshot: "${screenshotName}" (${viewport.width}x${viewport.height})`);
      
      await percyScreenshot(page, screenshotName, {
        width: viewport.width,
        minHeight: viewport.minHeight,
        fullPage: true
      });
    }
  });
});
