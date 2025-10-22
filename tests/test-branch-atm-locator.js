// tests/test-branch-atm-locator.js
// Branch ATM Locator functionality tests for VACU website
// Tests branch locator search, filters, and location details

import { test, expect } from '@playwright/test';
import environments from '../config/environments.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the test environment (default to 'test' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'test';
const environment = environments.find(env => env.name === testEnvironment) || environments[0];

test.describe('Branch ATM Locator', () => {
  test.beforeEach(async ({ page }) => {
    // Set window size as specified in Selenium tests
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('Filters/Map Functionality', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help/locations/branch-atm-locator`, { waitUntil: 'domcontentloaded' });
    
    // Search for location
    await page.click('#branch-locator-search');
    await page.fill('#branch-locator-search', '23249');
    await page.press('#branch-locator-search', 'Enter');
    
    // Verify 1st Advantage FCU result
    const firstResult = page.locator('#branch-locator > div.branch-locator__content > div > div:nth-child(1)');
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText('1st Advantage FCU');
    
    // Click filters and apply various options
    await page.click('xpath=//button[contains(text(), "Filters")]');
    await page.selectOption('#filter--vacu-radius', '15');
    await page.click('xpath=//label[contains(text(), "VACU Full Service Branches & ATMs")]');
    await page.click('xpath=//label[contains(text(), "Drive-thru")]');
    await page.click('xpath=//label[contains(text(), "24-Hour ATM")]');
    await page.click('label[for="filter--deposit-taking"]');
    await page.click('label[for="filter--safe-deposit"]');
    await page.click('label[for="filter--cashier-check"]');
    await page.click('label[for="filter--check-cashing"]');
    await page.click('label[for="filter--coinstar"]');
    await page.click('xpath=//button[contains(text(), "Apply")]');
    
    // Verify Hancock Village result
    const locationTitle = page.locator('div[title="Center location on map"] > h2:has-text("Hancock Village Branch & ATM")');
    await expect(locationTitle).toBeVisible();
    await expect(locationTitle).toContainText('Hancock Village Branch & ATM');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/branch-locator-filters-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Schedule An Appointment Button', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help/locations/branch-atm-locator`, { waitUntil: 'domcontentloaded' });
    
    // Verify and click appointment button
    const appointmentButton = page.locator('#\\#top > div > div.l-container.l-container--wide > div > div > a');
    await expect(appointmentButton).toBeVisible();
    await appointmentButton.click();
    
    // Verify header
    await expect(page.locator('#\\#top > div > div.l-container.l-container--wide > div > h1 > span')).toBeVisible();
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/branch-locator-appointment-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Search for Location - Brandermill', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help/locations/branch-atm-locator`, { waitUntil: 'domcontentloaded' });
    
    // Search for location
    await page.click('#branch-locator-search');
    await page.fill('#branch-locator-search', '23832');
    await page.press('#branch-locator-search', 'Enter');
    
    // Verify Hancock Village result
    const resultContainer = page.locator('#branch-locator > div.branch-locator__content > div');
    await expect(resultContainer).toBeVisible();
    await expect(resultContainer).toContainText('Hancock Village Branch & ATM');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/branch-locator-brandermill-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Search for Location - Charlottesville', async ({ page, context }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help/locations/branch-atm-locator`, { waitUntil: 'domcontentloaded' });
    
    // Search for location
    await page.click('#branch-locator-search');
    await page.fill('#branch-locator-search', '22901');
    await page.press('#branch-locator-search', 'Enter');
    
    // Wait for branch locator to be ready and click on location card and details
    await waitForBranchLocatorReady(page);
    await safeClick(page, '[title="Center location on map"].branch-locator__card.card-item.haslink');
    await safeClick(page, 'div.branch-locator__card-wrapper:nth-of-type(1) > a[title="View location details"].card__info-trigger > svg');
    
    // Verify location details
    await expect(page.locator('.location-details__services > div:nth-of-type(1)')).toBeVisible();
    await expect(page.locator('svg.svg-inline--fa.fa-car')).toBeVisible();
    
    // Verify phone number
    const phoneLink = page.locator('a[href="tel:+14349747191"]');
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toContainText('(434) 974-7191');
    
    // Verify address link
    await expect(page.locator('a[href="https://www.google.com/maps/search/?api=1&query=120%20Seminole%20Ct%20Charlottesville,%20VA%2022901"] > address')).toBeVisible();
    
    // Verify header content
    await expect(page.locator('.location-details__header-content')).toBeVisible();
    const headerTitle = page.locator('.location-details__header-content > h1');
    await expect(headerTitle).toBeVisible();
    await expect(headerTitle).toContainText('Seminole Square Branch');
    
    const headerDesc = page.locator('.location-details__header-content > p');
    await expect(headerDesc).toBeVisible();
    await expect(headerDesc).toContainText('VACU Branch');
    
    // Verify and click appointment button
    const appointmentButton = page.locator('a[href="/help/locations/branch-atm-locator/21"].vacu-button');
    await expect(appointmentButton).toBeVisible();
    await expect(appointmentButton).toContainText('Schedule an Appointment');

    // Create a promise for the new page
    const pagePromise = context.waitForEvent('page');

    // Click appointment button
    await appointmentButton.click();
    
    // Wait for the new page
    const popup = await pagePromise;
    await popup.waitForLoadState('domcontentloaded');
    
    // Verify we're on the appointment page
    await expect(popup).toHaveURL(/.*\/help\/locations\/branch-atm-locator\/21/);
    await expect(popup.locator('h1.basic-title')).toBeVisible();
    await expect(popup.locator('h1.basic-title')).toContainText('Schedule an Appointment');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/branch-locator-charlottesville-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Search for Location - Church Hill', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help/locations/branch-atm-locator`, { waitUntil: 'domcontentloaded' });
    
    // Search for location
    await page.click('#branch-locator-search');
    await page.fill('#branch-locator-search', '2420 Fairmount Ave Richmond, VA 23223');
    await page.press('#branch-locator-search', 'Enter');
    
    // Wait for branch locator to be ready and click first result
    await waitForBranchLocatorReady(page);
    await safeClick(page, '#branch-locator > div.branch-locator__content > div > div:nth-child(1) > a');
    
    // Verify hours section
    const hoursTitle = page.locator('div.location-details__hours:nth-of-type(2) > h2');
    await expect(hoursTitle).toBeVisible();
    await expect(hoursTitle).toContainText('Full Hours of Operation');
    
    const hoursText = page.locator('div.location-details__hours:nth-of-type(2) > dl > dd:nth-of-type(1)');
    await expect(hoursText).toBeVisible();
    await expect(hoursText).toContainText('9 am - 5 pm');
    
    await expect(page.locator('.location-details__body > div.location-details__hours:nth-of-type(2)')).toBeVisible();
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/branch-locator-church-hill-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Search for Location - Colonial Heights', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help/locations/branch-atm-locator`, { waitUntil: 'domcontentloaded' });
    
    // Search for location
    await page.click('#branch-locator-search');
    await page.fill('#branch-locator-search', '307 Yorktown Drive, Colonial Heights VA');
    await page.press('#branch-locator-search', 'Enter');
    
    // Wait for branch locator to be ready and open location details
    await waitForBranchLocatorReady(page);
    await openLocationDetails(page, 'Southpark Branch');
    
    // Verify distance - try multiple possible selectors
    let distanceText = page.locator('.location-details__vitals > dl > dd:nth-of-type(1)');
    if (await distanceText.count() === 0) {
      console.log('🔍 First distance selector not found, trying alternative...');
      // Try alternative selector
      distanceText = page.locator('.location-details__vitals dd:has-text("miles away")');
    }
    if (await distanceText.count() === 0) {
      console.log('🔍 Second distance selector not found, trying another alternative...');
      // Try another alternative
      distanceText = page.locator('.location-details dd:has-text("miles away")');
    }
    if (await distanceText.count() === 0) {
      console.log('🔍 No distance selectors found, taking screenshot for debugging...');
      await page.screenshot({ 
        path: `test-results/screenshots/colonial-heights-no-distance-${Date.now()}.png`,
        fullPage: true 
      });
      throw new Error('Could not find distance text element with any selector');
    }
    
    await expect(distanceText).toBeVisible({ timeout: 10000 });
    await expect(distanceText).toContainText('miles away');
    
    // Verify phone number
    const phoneLink = page.locator('a[href="tel:+18042536195"]');
    await expect(phoneLink).toBeVisible({ timeout: 10000 });
    await expect(phoneLink).toContainText('(804) 253-6195');
    
    // Verify address and location name
    await expect(page.locator('a[href="https://www.google.com/maps/search/?api=1&query=301%20Temple%20Lake%20Dr%20Colonial%20Heights,%20VA%2023834"] > address')).toBeVisible({ timeout: 10000 });
    
    // Verify the location title in the details
    const locationTitle = page.locator('.location-details h1, .location-details__header-content h1');
    await expect(locationTitle).toBeVisible({ timeout: 10000 });
    await expect(locationTitle).toContainText('Southpark Branch');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/branch-locator-colonial-heights-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Search for Location - NYC', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/help/locations/branch-atm-locator`, { waitUntil: 'domcontentloaded' });
    
    // Search for location
    await page.click('#branch-locator-search');
    await page.fill('#branch-locator-search', 'New York City, New York');
    await page.press('#branch-locator-search', 'Enter');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/branch-locator-nyc-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  // Helper function to wait for branch locator to be ready
  async function waitForBranchLocatorReady(page) {
    // Wait for loading overlay to disappear
    await page.waitForSelector('.branch-locator__loading-overlay', { state: 'hidden', timeout: 10000 });
    
    // Wait a bit more for any animations to complete
    await page.waitForTimeout(500);
  }

  // Helper function to safely click on branch locator elements
  async function safeClick(page, selector, options = {}) {
    try {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.click({ force: true, timeout: 15000, ...options });
    } catch (error) {
      console.log(`❌ Failed to click on selector: ${selector}`);
      console.log(`Error: ${error.message}`);
      
      // Take a screenshot for debugging
      await page.screenshot({ 
        path: `test-results/screenshots/branch-locator-click-error-${Date.now()}.png`,
        fullPage: true 
      });
      
      throw error;
    }
  }

  // Helper function to open location details for a specific branch
  async function openLocationDetails(page, branchName) {
    console.log(`🔍 Looking for branch: ${branchName}`);
    
    // Wait for results to appear
    await page.waitForSelector('.branch-locator__card', { timeout: 10000 });
    
    // Find the specific branch card
    const branchCard = page.locator('.branch-locator__card').filter({ hasText: branchName });
    await expect(branchCard).toBeVisible({ timeout: 10000 });
    console.log(`✅ Found branch card for: ${branchName}`);
    
    // Click on the branch card to center it on map
    await safeClick(page, `.branch-locator__card:has-text("${branchName}")`);
    console.log(`✅ Clicked on branch card for: ${branchName}`);
    
    // Wait a moment for the card to be selected
    await page.waitForTimeout(1000);
    
    // Find and click the details trigger
    const detailsTrigger = page.locator(`.branch-locator__card:has-text("${branchName}") a[title="View location details"]`);
    await expect(detailsTrigger).toBeVisible({ timeout: 10000 });
    await safeClick(page, `.branch-locator__card:has-text("${branchName}") a[title="View location details"]`);
    console.log(`✅ Clicked details trigger for: ${branchName}`);
    
    // Wait for location details modal/popup to appear
    await page.waitForSelector('.location-details', { timeout: 10000 });
    console.log(`✅ Location details modal opened for: ${branchName}`);
  }
});
