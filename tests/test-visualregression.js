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

//  Run testsin serial or parallel
test.describe.configure({ mode: 'parallel' });

// Get the test environment (default to 'live' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'live';

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

// Set Percy branch to environment name for normal visual regression tests
// This overrides Percy's automatic Git branch detection
process.env.PERCY_BRANCH = environment.name;

console.log(`🌿 Using Percy branch: ${environment.name} (environment-based)`);

pages.forEach(({ name, path }) => {
  const url = `${environment.host}${path}`;
  test(`${name}`, async ({ page }, testInfo) => {
    // Navigate & let things settle a touch
    // BrowserStack mobile Safari only supports 'load', others can use 'domcontentloaded'
    const projectName = testInfo.project.name;
    
    // Navigate with appropriate wait strategy
    // BrowserStack mobile Safari only supports 'load', others can use 'domcontentloaded'
    const waitUntil = (projectName.includes('iPhone') || projectName.includes('ios')) ? 'load' : 'domcontentloaded';
    
    try {
      console.log(`🌐 Navigating to ${url} (waitUntil: ${waitUntil})`);
      
      await page.goto(url, { 
        waitUntil,
        timeout: 1 * 60 * 1000 // 1 minutes
      });
      
      // Check if navigation actually succeeded
      const currentUrl = page.url();
      if (!currentUrl.startsWith(environment.host)) {
        throw new Error(`Navigation may have failed - expected URL starting with ${environment.host}, got ${currentUrl}`);
      }
      
      console.log(`✅ Navigation successful - current URL: ${currentUrl}`);
      
      // Wait a moment for any lazy-loaded content
      await page.waitForTimeout(1000);
    } catch (error) {
      // Provide helpful error information
      const currentUrl = page.url();
      const errorMessage = error.message || 'Unknown error';
      
      console.error(`❌ Navigation failed for ${url}`);
      console.error(`   Error: ${errorMessage}`);
      console.error(`   Current page URL: ${currentUrl || 'Unknown'}`);
      console.error(`   Project: ${projectName}`);
      
      // If it's a timeout, provide specific guidance
      if (error.name === 'TimeoutError' || errorMessage.includes('timeout')) {
        throw new Error(
          `Navigation timeout after 5 minutes for ${url}.\n` +
          `This could indicate:\n` +
          `- The site (${environment.host}) is slow or unresponsive\n` +
          `- Network connectivity issues from BrowserStack to Pantheon\n` +
          `- The page has blocking resources that never load\n` +
          `- Check BrowserStack dashboard for network logs and screenshots\n` +
          `- Verify the site is accessible: ${url}`
        );
      }
      
      throw error;
    }

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
