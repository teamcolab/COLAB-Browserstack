// tests/test-search.js
// Search functionality tests for VACU website
// Tests search functionality across different browsers and devices

import { test, expect } from '@playwright/test';
import environments from '../config/environments.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the test environment (default to 'test' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'test';
const environment = environments.find(env => env.name === testEnvironment) || environments[0];

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(environment.host, { waitUntil: 'domcontentloaded' });
    // Wait for page to stabilize after DOM is ready
    await page.waitForTimeout(3000);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('Search for Rates', async ({ page }, testInfo) => {
    // Click on the search input
    await page.click('#edit-search_1799959414');
    
    // Fill in the search term
    await page.fill('#edit-search_1799959414', 'Rates');
    
    // Click the search button
    await page.click('#edit-submit-content-search_432500690 > svg');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Click on the first result
    await page.click('#block-vacu-emulsify-mainpagecontent > div > div > div > ul > li:nth-child(1) > div:nth-child(1) > span > h2 > a');
    
    // Verify rates page
    await expect(page.locator('h1.basic-title > span')).toHaveText('Rates');
    
    // Click on Business Savings Certificate Rates
    await page.click('xpath=//button[contains(text(), "Business Savings Certificate Rates")]');
    
    // Verify business rates section
    await expect(page.locator('#business')).toHaveText('Business Deposit Rates');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/search-rates-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Search for empty string', async ({ page }, testInfo) => {
    // Click on the search input
    await page.click('#edit-search_1799959414');
    
    // Search with empty string
    await page.fill('#edit-search_1799959414', '');
    
    // Click the search button
    await page.click('#edit-submit-content-search_432500690 > svg');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/search-empty-${testInfo.project.name}-${environment.name}.png` 
    });
  });
});
