// tests/test-online-banking-menu.js
// Online Banking Menu functionality tests for VACU website
// Tests online banking login, enrollment, and help functionality

import { test, expect } from '@playwright/test';
import environments from '../config/environments.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the test environment (default to 'test' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'test';
const environment = environments.find(env => env.name === testEnvironment) || environments[0];

test.describe('Online Banking Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(environment.host, { waitUntil: 'domcontentloaded' });
    // Wait for page to stabilize after DOM is ready
    await page.waitForTimeout(3000);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('Login - 1280x800', async ({ page }, testInfo) => {
    // Set default viewport size for OLB checks
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Click online banking trigger and wait for menu
    await page.click('css=#online-banking-trigger');
    
    // Wait for and fill in user ID - using more specific selector
    const userIdInput = page.locator('#personal-login-desktop #user_id');
    await userIdInput.waitFor({ state: 'visible' });
    await userIdInput.fill('test@teamcolab.com');
    
    // Wait for and click login button
    const loginButton = page.locator('xpath=//*[@id="Q2OnlineLogin"]/button');
    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-login-1280x800-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Login - 1194x834', async ({ page }, testInfo) => {
    // Set specific viewport size for OLB checks
    await page.setViewportSize({ width: 1194, height: 834 });
    
    // Click online banking trigger and wait for menu
    await page.click('css=#online-banking-trigger');
    
    // Wait for and fill in user ID - using more specific selector
    const userIdInput = page.locator('#personal-login-desktop #user_id');
    await userIdInput.waitFor({ state: 'visible' });
    await userIdInput.fill('test@teamcolab.com');
    
    // Wait for and click login button
    const loginButton = page.locator('xpath=//*[@id="Q2OnlineLogin"]/button');
    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-login-1194x834-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Enroll Personal', async ({ page, context }, testInfo) => {
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');

    // Click enroll link
    await page.click('xpath=//*[@id="personal-login-desktop"]/div[3]/a');

    // Create a promise for the new page
    const pagePromise = context.waitForEvent('page');

    // Click Personal Banking link
    await page.click('xpath=//a[contains(text(), "Personal Banking")]');
    
    // Wait for the new page
    const popup = await pagePromise;
    await popup.waitForLoadState('networkidle');
    
    // Verify page title in new tab
    await expect(popup.locator('css=#page_title')).toContainText('Personal Online Banking Enrollment');
    
    // Take screenshot of the new tab with project name for identification
    await popup.screenshot({ 
      path: `test-results/screenshots/online-banking-enroll-personal-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Enroll Business', async ({ page, context }, testInfo) => {
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');

    // Click enroll link
    await page.click('xpath=//*[@id="personal-login-desktop"]/div[3]/a');

    // Create a promise for the new page
    const pagePromise = context.waitForEvent('page');

    // Click Business Banking link
    await page.click('xpath=//a[contains(text(), "Business Banking")]');
    
    // Wait for the new page
    const popup = await pagePromise;
    await popup.waitForLoadState('networkidle');
    
    // Verify page title in new tab
    await expect(popup.locator('css=#page_title')).toContainText('Business Online Banking Enrollment');
    
    // Take screenshot of the new tab with project name for identification
    await popup.screenshot({ 
      path: `test-results/screenshots/online-banking-enroll-business-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Enroll Modal Display Check', async ({ page }, testInfo) => {
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');
    
    // Click user ID label
    await page.click('css=#Q2OnlineLogin > label[for="user_id"]');
    
    // Click enroll link
    await page.click('css=#personal-login-desktop > .enroll > a[href="https://olb.vacu.org/vacuonlinebanking/sdk/autoenrollmente2e"].js-olbEnroll');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-enroll-modal-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Enroll options visible', async ({ page }, testInfo) => {
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');
    
    // Verify mobile banking link is present
    await expect(page.locator('css=#open-mobile-banking > div > a')).toBeVisible();
    
    // Verify enroll link is present and contains text
    const enrollLink = page.locator('xpath=//*[@id="personal-login-desktop"]/div[3]/a');
    await expect(enrollLink).toBeVisible();
    await expect(enrollLink).toContainText('Enroll');
    
    // Click enroll link
    await enrollLink.click();
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-enroll-options-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Login Help Business - 1280x800', async ({ page, context }, testInfo) => {
    // Set default viewport size for OLB checks
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');
    
    // Click login help link
    await page.click('#personal-login-desktop > div.online-banking__forgot-id > a');

    // Wait for modal to be visible
    await page.waitForSelector('div.modal.is-active');

    // Create a promise for the new page BEFORE clicking the link that opens it
    const pagePromise = context.waitForEvent('page');
    
    // Click business contact us link which opens new page
    await page.click('body > div.push.js-push > div > div.modal.is-active > div.modal-card.content > div > section.modal-card-ctas > a:nth-child(2)');
    
    // Wait for the new page
    const popup = await pagePromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForTimeout(3000); // Give time for initial rendering
    
    // Verify contact us page title in new tab
    await expect(popup.locator('css=h1.h1--banner')).toContainText('Contact Us');
    
    // Take screenshot of new page with project name for identification
    await popup.screenshot({ 
      path: `test-results/screenshots/online-banking-login-help-business-1280x800-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Login Help Business - 1194x834', async ({ page, context }, testInfo) => {
    // Set specific viewport size for OLB checks
    await page.setViewportSize({ width: 1194, height: 834 });
    
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');
    
    // Click login help link
    await page.click('#personal-login-desktop > div.online-banking__forgot-id > a');

    // Wait for modal to be visible
    await page.waitForSelector('div.modal.is-active');

    // Create a promise for the new page BEFORE clicking the link that opens it
    const pagePromise = context.waitForEvent('page');
    
    // Click business contact us link which opens new page
    await page.click('body > div.push.js-push > div > div.modal.is-active > div.modal-card.content > div > section.modal-card-ctas > a:nth-child(2)');
    
    // Wait for the new page
    const popup = await pagePromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForTimeout(3000); // Give time for initial rendering
    
    // Verify contact us page title in new tab
    await expect(popup.locator('css=h1.h1--banner')).toContainText('Contact Us');
    
    // Take screenshot of new page with project name for identification
    await popup.screenshot({ 
      path: `test-results/screenshots/online-banking-login-help-business-1194x834-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Login Help Modal Display - 1280x800', async ({ page }, testInfo) => {
    // Set default viewport size for OLB checks
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');
    
    // Click forgot user ID link
    await page.click('css=#personal-login-desktop > .online-banking__forgot-id > a[href="https://olb.vacu.org/vacuonlinebanking/sdk/autoenrollmente2e/AccountRecovery"].js-forgotUserID');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-login-help-modal-1280x800-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Login Help Modal Display - 1194x834', async ({ page }, testInfo) => {
    // Set specific viewport size for OLB checks
    await page.setViewportSize({ width: 1194, height: 834 });
    
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');
    
    // Click forgot user ID link
    await page.click('css=#personal-login-desktop > .online-banking__forgot-id > a[href="https://olb.vacu.org/vacuonlinebanking/sdk/autoenrollmente2e/AccountRecovery"].js-forgotUserID');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-login-help-modal-1194x834-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Personal: Unlock User or Recover ID - 1280x800', async ({ page }, testInfo) => {
    // Set default viewport size for OLB checks
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');
    
    // Click login help link
    await page.click('xpath=//*[@id="personal-login-desktop"]/div[2]/a');
    
    // Click unlock/recover link
    await page.click('xpath=//a[contains(text(), "Personal: Unlock User or Recover ID")]');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-unlock-recover-1280x800-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Personal: Unlock User or Recover ID - 1194x834', async ({ page }, testInfo) => {
    // Set specific viewport size for OLB checks
    await page.setViewportSize({ width: 1194, height: 834 });
    
    // Click online banking trigger
    await page.click('css=#online-banking-trigger');
    
    // Click login help link
    await page.click('xpath=//*[@id="personal-login-desktop"]/div[2]/a');
    
    // Click unlock/recover link
    await page.click('xpath=//a[contains(text(), "Personal: Unlock User or Recover ID")]');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-unlock-recover-1194x834-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('User ID OLB Login check - 1280x800', async ({ page }, testInfo) => {
    // Set default viewport size for OLB checks
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Click online banking trigger and wait for menu
    await page.click('css=#online-banking-trigger');
    
    // Wait for and fill in user ID - using more specific selector
    const userIdInput = page.locator('#personal-login-desktop #user_id');
    await userIdInput.waitFor({ state: 'visible' });
    await userIdInput.fill('test@teamcolab.com');
    
    // Wait for and click login button
    const loginButton = page.locator('xpath=//*[@id="Q2OnlineLogin"]/button');
    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-user-id-check-1280x800-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('User ID OLB Login check - 1194x834', async ({ page }, testInfo) => {
    // Set specific viewport size for OLB checks
    await page.setViewportSize({ width: 1194, height: 834 });
    
    // Click online banking trigger and wait for menu
    await page.click('css=#online-banking-trigger');
    
    // Wait for and fill in user ID - using more specific selector
    const userIdInput = page.locator('#personal-login-desktop #user_id');
    await userIdInput.waitFor({ state: 'visible' });
    await userIdInput.fill('test@teamcolab.com');
    
    // Wait for and click login button
    const loginButton = page.locator('xpath=//*[@id="Q2OnlineLogin"]/button');
    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/online-banking-user-id-check-1194x834-${testInfo.project.name}-${environment.name}.png` 
    });
  });
});
