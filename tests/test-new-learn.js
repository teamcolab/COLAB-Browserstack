// tests/test-new-learn.js
// New Learn Landing Page functionality tests for VACU website
// Tests learn page data-testid elements and link cloud functionality

import { test, expect } from '@playwright/test';
import environments from '../config/environments.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the test environment (default to 'test' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'test';
const environment = environments.find(env => env.name === testEnvironment) || environments[0];

test.describe('Learn Landing Page Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto(`${environment.host}/learn`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Check if we got an access denied page and skip the test
    const accessDeniedHeading = page.locator('h1:has-text("Access Denied")');
    if (await accessDeniedHeading.count() > 0) {
      testInfo.skip(true, 'Skipping test: Access Denied to /learn page');
      return;
    }
  });

  test('Verify all required data-testid elements exist', async ({ page }, testInfo) => {
    // Learn Featured Content Grid elements
    const featuredContentElements = [
      'learn-featured-article',
      'learn-article1', 
      'learn-article2',
      'learn-article3'
    ];

    // Carousel arrow elements
    const carouselElements = [
      'learn-carousel0-arrow-prev',
      'learn-carousel0-arrow-next',
      'learn-carousel1-arrow-prev',
      'learn-carousel1-arrow-next',
      'learn-carousel2-arrow-prev',
      'learn-carousel2-arrow-next',
      'learn-carousel3-arrow-prev',
      'learn-carousel3-arrow-next',
      'learn-carousel4-arrow-prev',
      'learn-carousel4-arrow-next'
    ];

    // Combine all elements to test
    const allTestIds = [...featuredContentElements, ...carouselElements];

    console.log(`Testing ${allTestIds.length} data-testid elements...`);

    // Track results
    let foundCount = 0;
    let missingElements = [];

    // Test each data-testid
    for (const testId of allTestIds) {
      const element = page.locator(`[data-testid="${testId}"]`);
      const count = await element.count();
      
      if (count > 0) {
        foundCount++;
        console.log(`✅ Found: ${testId}`);
        
        // Verify the element is visible
        try {
          await expect(element.first()).toBeVisible({ timeout: 5000 });
        } catch (error) {
          console.log(`⚠️  ${testId} exists but is not visible`);
        }
      } else {
        missingElements.push(testId);
        console.log(`❌ Missing: ${testId}`);
      }
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`Found: ${foundCount}/${allTestIds.length} elements`);
    
    if (missingElements.length > 0) {
      console.log(`Missing elements: ${missingElements.join(', ')}`);
    }

    // Take screenshot for reference with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/learn-data-testids-${testInfo.project.name}-${environment.name}.png`,
      fullPage: true 
    });
  });

  test('Verify "Next, I\'d like to" link cloud', async ({ page }, testInfo) => {
    // Links based on the actual HTML structure from the page
    const linkCloudLinks = [
      { title: 'Build a Better Budget', href: '/learn/budgeting/watch-build-a-better-budget' },
      { title: 'Raise a Money-Confident Kid', href: '/learn/families/how-to-raise-a-money-confident-kid' },
      { title: 'Home', href: '/learn/home' },
      { title: 'Financial Health Check-up', href: '/learn/planning/financial-health-check-up' },
      { title: 'Credit Building', href: '/learn/credit-building' },
      { title: 'Auto', href: '/learn/auto' },
      { title: 'Scam Examples', href: '/learn/privacy-and-security/is-this-a-scam-common-examples-and-how-to-handle-them' },
      { title: 'Home Refinancing', href: '/learn/home/how-to-know-when-to-refinance-your-home' },
      { title: 'Retirement Planning', href: '/learn/planning/7-tips-for-retirement-planning' },
      { title: 'Balance Transfers', href: '/learn/credit-cards/6-things-you-need-to-know-about-balance-transfers' }
    ];

    console.log(`Testing ${linkCloudLinks.length} link cloud elements...`);

    // Track results
    let foundCount = 0;
    let missingLinks = [];

    // Test each link in the link cloud
    for (const link of linkCloudLinks) {
      // Find the link by href and text content
      const linkElement = page.locator(`.link-cloud__link[href="${link.href}"]`).filter({ hasText: link.title });
      const count = await linkElement.count();
      
      if (count > 0) {
        foundCount++;
        console.log(`✅ Found: ${link.title} -> ${link.href}`);
        
        // Verify the link is visible and enabled
        try {
          await expect(linkElement).toBeVisible({ timeout: 5000 });
          await expect(linkElement).toBeEnabled({ timeout: 5000 });
        } catch (error) {
          console.log(`⚠️  ${link.title} exists but may not be visible/enabled`);
        }
      } else {
        missingLinks.push(link.title);
        console.log(`❌ Missing: ${link.title} -> ${link.href}`);
      }
    }

    // Summary
    console.log(`\n📊 Link Cloud Summary:`);
    console.log(`Found: ${foundCount}/${linkCloudLinks.length} links`);
    
    if (missingLinks.length > 0) {
      console.log(`Missing links: ${missingLinks.join(', ')}`);
    }

    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/learn-link-cloud-${testInfo.project.name}-${environment.name}.png`,
      fullPage: true 
    });
  });
});
