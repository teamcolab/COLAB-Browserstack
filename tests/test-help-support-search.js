// tests/test-help-support-search.js
// Help Support Search functionality tests for VACU website
// Tests help search functionality and navigation

import { test, expect } from '@playwright/test';
import environments from '../config/environments.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the test environment (default to 'test' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'test';
const environment = environments.find(env => env.name === testEnvironment) || environments[0];

test.describe('Help Support Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(environment.host, { waitUntil: 'domcontentloaded' });
    // Wait for page to stabilize after DOM is ready
    await page.waitForTimeout(3000);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('How do I pay?', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help`, { waitUntil: 'domcontentloaded' });
    
    // Click and fill search input
    const searchInput = page.locator('#edit-term');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.click();
    await searchInput.fill('How do I pay my loan?');
    
    // Click Find Answer button and wait for results
    const findAnswerButton = page.locator('button:has-text("Find Answer")');
    await findAnswerButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Wait for search results to be visible
    const resultsContainer = page.locator('.help-search-results, #block-vacu-emulsify-mainpagecontent');
    await resultsContainer.waitFor({ state: 'visible' });
    
    // Verify Bill Pay result is present and contains correct text
    const resultLink = page.locator('article a:has-text("Bill Pay")');
    await expect(resultLink).toBeVisible();
    await expect(resultLink).toContainText('Bill Pay');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/help-support-search-payment-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Re-Order Checks', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help`, { waitUntil: 'domcontentloaded' });
    
    // Click and fill search input
    await page.click('#edit-term');
    await page.fill('#edit-term', 'Re-order Checks');
    
    // Click Find Answer button
    await page.click('#edit-submit-help-search');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify Order Checks result is present and contains correct text
    const resultTitle = page.locator('xpath=//*[@id="block-vacu-emulsify-mainpagecontent"]/div/div/div/div/div/div[1]/article/a/h6');
    await expect(resultTitle).toBeVisible();
    await expect(resultTitle).toContainText('Order Checks');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/help-support-search-check-reorder-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Scholarships search', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help`, { waitUntil: 'domcontentloaded' });
    
    // Click and fill search input
    await page.click('#edit-term');
    await page.click('#edit-term'); // Double click as per Selenium
    await page.fill('#edit-term', 'scholarships');
    
    // Click Find Answer button
    await page.click('#edit-submit-help-search');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify Scholarships FAQs result is present and contains correct text
    const resultTitle = page.locator('xpath=//*[@id="block-vacu-emulsify-mainpagecontent"]/div/div/div/div/div/div/article/a/h6');
    await expect(resultTitle).toBeVisible();
    await expect(resultTitle).toContainText('Scholarships FAQs');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/help-support-search-scholarships-${testInfo.project.name}-${environment.name}.png` 
    });
  });
});
