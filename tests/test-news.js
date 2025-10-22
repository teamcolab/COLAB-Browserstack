// tests/test-news.js
// News functionality tests for VACU website
// Tests news article search and navigation

import { test } from '@playwright/test';
import environments from '../config/environments.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the test environment (default to 'test' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'test';
const environment = environments.find(env => env.name === testEnvironment) || environments[0];

test.describe('News', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(environment.host, { 
      waitUntil: 'domcontentloaded',
      timeout: 120000 
    });
  });

  test('$15k grant', async ({ page }, testInfo) => {
    // Click on the search input
    await page.click('#edit-search_1799959414');
    
    // Fill in the search term
    await page.fill('#edit-search_1799959414', 'VACU Awards $15,000 Youth Advancement Grant');
    
    // Click the search button
    await page.click('#edit-submit-content-search_432500690 > svg');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Click on the news article
    await page.click('#block-vacu-emulsify-mainpagecontent > div > div > div > ul > li:nth-child(2) > div:nth-child(1) > span > h2 > a');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/news-15k-grant-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Strike Out Hunger', async ({ page }, testInfo) => {
    // Click on the search input
    await page.click('#edit-search_1799959414');
    
    // Fill in the search term
    await page.fill('#edit-search_1799959414', 'Strike Out Hunger');
    
    // Click the search button
    await page.click('#edit-submit-content-search_432500690 > svg');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Click on the news article
    await page.click('#block-vacu-emulsify-mainpagecontent > div > div > div > ul > li:nth-child(2) > div:nth-child(1) > span > h2 > a');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/news-strike-out-hunger-${testInfo.project.name}-${environment.name}.png` 
    });
  });
});
