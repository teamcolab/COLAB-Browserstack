// Load environment variables from .env file
require('dotenv').config();

// This is a sample config for what users might be running locally
const config = {
  testDir: './tests',
  testMatch: '**/test-staging*.js',

  /* Maximum time one test can run for. */
  timeout: 180 * 1000,
  use: 
    {
      actionTimeout: 180 * 1000,                  // or a higher value if you want
      navigationTimeout: 180 * 1000
   },
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 50000,
  },
  /* tests in parallel */
  workers: 1,

  retries: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list']],
  /* Configure projects for major browsers */
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox',  use: { browserName: 'firefox' } },
    { name: 'edge',   use: { browserName: 'edge' } },
  ],
};

module.exports = config;
