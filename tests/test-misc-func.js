// tests/test-misc-func.js
// Miscellaneous functionality tests for VACU website
// Tests various page functionality and navigation

import { test, expect } from '@playwright/test';
import environments from '../config/environments.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the test environment (default to 'test' if not specified)
const testEnvironment = process.env.TEST_ENVIRONMENT || 'test';
const environment = environments.find(env => env.name === testEnvironment) || environments[0];

test.describe('Miscellaneous Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(environment.host, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    // Wait for page to stabilize after DOM is ready
    await page.waitForTimeout(3000);
  });

  test('Business Online Banking', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(`${environment.host}/business/business-online-banking`, { waitUntil: 'domcontentloaded' });
    
    // Verify hero section exists
    await expect(page.locator('.o-hero')).toBeVisible();
    
    // Verify heading text
    const heading = page.locator('.m-editor > h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Business Online Banking');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/misc-func-business-online-banking-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Contact Us - Contact items', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(environment.host, { waitUntil: 'domcontentloaded' });
    
    // Click Contact Us in submenu
    const contactLink = page.locator('.submenu > li.menu-item:nth-of-type(2) > a[href="/contact-us"]');
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toContainText('Contact Us');
    await contactLink.click();

    // Verify Email Us section
    const emailSection = page.locator('a[href="https://apps.vacu.org/vwa/securemessage"] > .m-infobox__text');
    await expect(emailSection).toBeVisible();
    await expect(emailSection).toContainText('Email Us');

    // Verify Phone section
    const phoneSection = page.locator('a[href="tel:+18043236800"] > .m-infobox__text');
    await expect(phoneSection).toBeVisible();
    await expect(phoneSection).toContainText('Call 804-323-6800');

    // Verify Visit Branch section
    const branchSection = page.locator('a[href*="/help/locations/branch-atm-locator"] > .m-infobox__text');
    await expect(branchSection).toBeVisible();
    await expect(branchSection).toContainText('Visit a Branch');

    // Verify Find Answers section
    const answersSection = page.locator('div.m-infobox:nth-of-type(4) > a[href*="/help"].m-infobox__link > .m-infobox__text');
    await expect(answersSection).toBeVisible();
    await expect(answersSection).toContainText('Find Answers');

    // Verify icons are present
    await expect(page.locator('svg.svg-inline--fa.fa-envelope.fa-2x')).toBeVisible();
    await expect(page.locator('svg.svg-inline--fa.fa-phone.fa-2x')).toBeVisible();
    await expect(page.locator('svg.svg-inline--fa.fa-university')).toBeVisible();
    await expect(page.locator('svg.svg-inline--fa.fa-question-circle.fa-2x')).toBeVisible();

    // Verify contact categories
    const categories = [
      { selector: 'li:nth-of-type(1) > a[href="/contact-us"]', text: 'Member Services' },
      { selector: 'a[href="/contact-us/loans"]', text: 'Loans' },
      { selector: 'a[href="/contact-us/mortgages"]', text: 'Mortgages' },
      { selector: 'a[href="/contact-us/credit-cards"]', text: 'Credit Cards' },
      { selector: 'a[href="/contact-us/debit-cards"]', text: 'Debit Cards' },
      { selector: 'a[href="/contact-us/online-banking-bill-pay"]', text: 'Online Banking & Bill Pay' },
      { selector: 'a[href="/contact-us/collections-recovery"]', text: 'Collections & Recovery' },
      { selector: 'a[href="/contact-us/general"]', text: 'General Contact' }
    ];

    for (const category of categories) {
      const element = page.locator(category.selector);
      await expect(element).toBeVisible();
      await expect(element).toContainText(category.text);
    }

    // Verify phone numbers and email links
    await expect(page.locator('a[href="tel:+18002856609"]')).toContainText('800-285-6609');
    await expect(page.locator('a[href="mailto:memsvc@vacu.org"]')).toContainText('send an email');
    await expect(page.locator('.m-infobox__link[href="https://apps.vacu.org/vwa/securemessage"]')).toBeVisible();

    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/misc-func-contact-us-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Intro - Landing', async ({ page }, testInfo) => {
    // Open start URL and set window size
    await page.goto(`${environment.host}/intro`, { waitUntil: 'domcontentloaded' });
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/misc-func-intro-landing-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Pre-Approved 2 Cards - Landing', async ({ page }, testInfo) => {
    // Open start URL and set window size
    await page.goto(`${environment.host}/youre-pre-approved-2-cards`, { waitUntil: 'domcontentloaded' });
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/misc-func-pre-approved-2-cards-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Pre-Approved 3 Cards - Landing', async ({ page }, testInfo) => {
    // Open start URL and set window size
    await page.goto(`${environment.host}/youre-pre-approved-3-cards`, { waitUntil: 'domcontentloaded' });
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/misc-func-pre-approved-3-cards-${testInfo.project.name}-${environment.name}.png` 
    });
  });

  test('Privacy Check VACU', async ({ page }, testInfo) => {
    // Open start URL
    await page.goto(environment.host, { waitUntil: 'domcontentloaded' });
    
    // Verify privacy link
    const privacyLink = page.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toContainText('Privacy');
    
    // Take screenshot with project name for identification
    await page.screenshot({ 
      path: `test-results/screenshots/misc-func-privacy-check-${testInfo.project.name}-${environment.name}.png` 
    });
  });
});
